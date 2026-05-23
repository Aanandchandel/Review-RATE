import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCompanies } from '../api';
import CompanyCard from '../components/CompanyCard';
import './Home.css';

export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [city, setCity] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('name');
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCompanies = useCallback(async (params) => {
    setLoading(true);
    setError('');
    try {
      const res = await getCompanies(params);
      setCompanies(res.data.companies);
      setTotal(res.data.total);
    } catch {
      setError('Failed to load companies. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies({ search: searchParams.get('search') || '', sort });
  }, [searchParams, sort, fetchCompanies]);

  const handleFind = (e) => {
    e.preventDefault();
    fetchCompanies({ city, search, sort });
  };

  return (
    <main className="home-page container">
      <div className="filter-bar ">
        <form className="filter-form" onSubmit={handleFind}>
          {/* City field with label and right-aligned icon */}
          <div className="field-group">
            <label htmlFor="city-input">Select City</label>
            <div className="city-input-wrapper">
              <input
                id="city-input"
                type="text"
                placeholder="City name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="city-input"
              />
              <span className="city-pin-right">
                <img src="/akar-icons_location.png" alt="Location" className="location-icon" />
              </span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Find Company
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/add-company')}
          >
            + Add Company
          </button>

          <div className=" field-group">
            <label htmlFor="sort-select">Sort:</label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="sort-select"
            >
              <option value="name">Name</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="founded">Founded</option>
            </select>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}

      <p className="results-count">
        {loading ? 'Loading…' : `Result Found: ${total}`}
      </p>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : companies.length === 0 ? (
        <div className="empty-state">
          <p>No companies found.</p>
          <button className="btn btn-primary" onClick={() => navigate('/add-company')}>
            + Add the first company
          </button>
        </div>
      ) : (
        <div className="companies-list">
          {companies.map((c) => (
            <CompanyCard key={c._id} company={c} />
          ))}
        </div>
      )}
    </main>
  );
}