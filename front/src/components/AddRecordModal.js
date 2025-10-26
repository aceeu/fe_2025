import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import './AddRecordModal.css';

const AddRecordModal = ({ isOpen, onClose, onRecordAdded }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    buyer: user?.name || '',
    category: '',
    buyDate: new Date().toISOString().split('T')[0], // Today's date
    product: '',
    sum: '',
    whom: '',
    note: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      // Reset form when modal opens, set buyer to logged user
      setFormData({
        buyer: user?.name || '',
        category: '',
        buyDate: new Date().toISOString().split('T')[0],
        product: '',
        sum: '',
        whom: '',
        note: ''
      });
      setError(null);
    }
  }, [isOpen, user]);

  const loadCategories = async () => {
    const result = await fetchCategories();
    if (result.success) {
      setCategories(result.categories);
      // Set first category as default if available
      if (result.categories.length > 0) {
        setFormData(prev => ({ ...prev, category: result.categories[0].category }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.buyer.trim()) {
      setError('Покупатель обязателен');
      return;
    }
    if (!formData.category) {
      setError('Категория обязательна');
      return;
    }
    if (!formData.product.trim()) {
      setError('Товар обязателен');
      return;
    }
    if (!formData.sum || parseFloat(formData.sum) <= 0) {
      setError('Сумма должна быть больше 0');
      return;
    }
    if (!formData.whom.trim()) {
      setError('Поле "Кому" обязательно');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8088/adddata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          _id: '', // Backend expects this field
          creator: user.name,
          buyer: formData.buyer,
          category: formData.category,
          buyDate: formData.buyDate,
          product: formData.product,
          sum: parseFloat(formData.sum),
          whom: formData.whom,
          note: formData.note
        })
      });

      const data = await response.json();

      if (data.res) {
        // Success
        onRecordAdded();
        onClose();
      } else {
        throw new Error(data.text || 'Не удалось добавить запись');
      }
    } catch (err) {
      console.error('Error adding record:', err);
      setError(err.message || 'Не удалось добавить запись');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Добавить новую запись</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-record-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="buyer">Покупатель *</label>
              <input
                type="text"
                id="buyer"
                name="buyer"
                value={formData.buyer}
                onChange={handleChange}
                placeholder="Введите имя покупателя"
                disabled={loading}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="category">Категория *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.cat}>
                    {cat.cat}
                  </option>
                )).sort((a,b) => a.entry - b.entry)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="buyDate">Дата *</label>
              <input
                type="date"
                id="buyDate"
                name="buyDate"
                value={formData.buyDate}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="sum">Сумма *</label>
              <input
                type="number"
                id="sum"
                name="sum"
                value={formData.sum}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="product">Товар *</label>
            <input
              type="text"
              id="product"
              name="product"
              value={formData.product}
              onChange={handleChange}
              placeholder="Введите название товара"
              disabled={loading}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="whom">Кому *</label>
            <input
              type="text"
              id="whom"
              name="whom"
              value={formData.whom}
              onChange={handleChange}
              placeholder="Для кого"
              disabled={loading}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="note">Примечание</label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Необязательное примечание"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Добавление...' : 'Добавить запись'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;
