import React from 'react';
import './DataGrid.css';

const DataGrid = ({ data, currentPage, itemsPerPage, onRecordDoubleClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="data-grid-empty">
        <p>Данные по выбранным фильтрам не найдены.</p>
      </div>
    );
  }

  // Calculate total sum of all records
  const totalSum = data.reduce((sum, item) => sum + (parseFloat(item.sum) || 0), 0);

  // Paginate data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount || 0);
  };

  return (
    <div className="data-grid-container">
      {/* Desktop Table View */}
      <div className="desktop-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Покупатель</th>
              <th>Категория</th>
              <th>Товар</th>
              <th>Сумма</th>
              <th>Кому</th>
              <th>Примечание</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={item._id || index}
                onDoubleClick={() => onRecordDoubleClick && onRecordDoubleClick(item)}
                className="editable-row"
                title="Дважды щёлкните для редактирования"
              >
                <td data-label="Дата">{formatDate(item.buyDate)}</td>
                <td data-label="Покупатель">{item.buyer || 'Н/Д'}</td>
                <td data-label="Категория">{item.category || 'Н/Д'}</td>
                <td data-label="Товар">{item.product || 'Н/Д'}</td>
                <td data-label="Сумма" className="currency">{formatCurrency(item.sum)}</td>
                <td data-label="Кому">{item.whom || 'Н/Д'}</td>
                <td data-label="Примечание">{item.note || '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="summary-row">
              <td colSpan="4" className="summary-label">Итого:</td>
              <td className="summary-value">{formatCurrency(totalSum)}</td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards">
        {paginatedData.map((item, index) => (
          <div
            key={item._id || index}
            className="data-card editable-card"
            onDoubleClick={() => onRecordDoubleClick && onRecordDoubleClick(item)}
            title="Дважды щёлкните для редактирования"
          >
            <div className="card-header">
              <span className="card-date">{formatDate(item.buyDate)}</span>
              <span className="card-amount">{formatCurrency(item.sum)}</span>
            </div>
            <div className="card-body">
              <div className="card-row">
                <span className="card-label">Покупатель:</span>
                <span className="card-value">{item.buyer || 'Н/Д'}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Категория:</span>
                <span className="card-value">{item.category || 'Н/Д'}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Товар:</span>
                <span className="card-value">{item.product || 'Н/Д'}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Кому:</span>
                <span className="card-value">{item.whom || 'Н/Д'}</span>
              </div>
              {item.note && (
                <div className="card-row">
                  <span className="card-label">Примечание:</span>
                  <span className="card-value">{item.note}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Mobile Summary */}
        <div className="mobile-summary">
          <div className="summary-content">
            <span className="summary-label">Итого:</span>
            <span className="summary-value">{formatCurrency(totalSum)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataGrid;
