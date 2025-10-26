import React, { useState, useEffect } from 'react';
import { fetchCategories, getUniqueBuyers } from '../services/dataService';
import './DataFilters.css';

const DataFilters = ({ onFilterChange, allData }) => {
  const [datePeriod, setDatePeriod] = useState('last_week');
  const [buyer, setBuyer] = useState('*');
  const [category, setCategory] = useState('*');
  const [categories, setCategories] = useState([]);
  const [buyers, setBuyers] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (allData && allData.length > 0) {
      const uniqueBuyers = getUniqueBuyers(allData);
      setBuyers(uniqueBuyers);
    }
  }, [allData]);

  const loadCategories = async () => {
    const result = await fetchCategories();
    if (result.success) {
      setCategories(result.categories);
    }
  };

  const handleFilterChange = () => {
    onFilterChange({
      datePeriod,
      buyer,
      category
    });
  };

  useEffect(() => {
    handleFilterChange();
  }, [datePeriod, buyer, category]);

  return (
    <div className="data-filters">
      <div className="filter-group">
        <label htmlFor="date-period">Период:</label>
        <select
          id="date-period"
          value={datePeriod}
          onChange={(e) => setDatePeriod(e.target.value)}
        >
          <option value="today">Сегодня</option>
          <option value="yesterday">Вчера</option>
          <option value="last_week">Последние 7 дней</option>
          <option value="last_month">Последние 30 дней</option>
          <option value="current_month">Текущий месяц</option>
          <option value="previous_month">Предыдущий месяц</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="buyer-filter">Покупатель:</label>
        <select
          id="buyer-filter"
          value={buyer}
          onChange={(e) => setBuyer(e.target.value)}
        >
          <option value="*">Все покупатели</option>
          {buyers.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="category-filter">Категория:</label>
        <select
          id="category-filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="*">Все категории</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.cat}>
              {cat.cat}
            </option>
          )).sort((a,b) => a.entry - b.entry)}
        </select>
      </div>
    </div>
  );
};

export default DataFilters;
