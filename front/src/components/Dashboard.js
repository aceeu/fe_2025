import React, { useState, useEffect } from 'react';
import { fetchData } from '../services/dataService';
import DataFilters from './DataFilters';
import DataGrid from './DataGrid';
import Pagination from './Pagination';
import AddRecordModal from './AddRecordModal';
import EditRecordModal from './EditRecordModal';
import './Dashboard.css';

const Dashboard = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [allData, setAllData] = useState([]); // Store all data for buyer list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filters, setFilters] = useState({
    datePeriod: 'last_week',
    buyer: '*',
    category: '*'
  });

  const itemsPerPage = 10;

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    loadData();
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const result = await fetchData(filters);

    if (result.success) {
      setFilteredData(result.data);

      // Store all data for getting unique buyers
      if (!allData.length) {
        setAllData(result.data);
      }
    } else {
      setError(result.error || 'Failed to load data');
      setFilteredData([]);
    }

    setLoading(false);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecordAdded = () => {
    // Reload data after adding a new record
    loadData();
  };

  const handleRecordDoubleClick = (record) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleRecordUpdated = () => {
    // Reload data after editing a record
    loadData();
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h2>Записи данных</h2>
          {filteredData.length > 0 && (
            <div className="record-count">
              Всего: <strong>{filteredData.length}</strong> {filteredData.length === 1 ? 'запись' : filteredData.length < 5 ? 'записи' : 'записей'}
            </div>
          )}
        </div>
        <button
          className="add-record-button"
          onClick={() => setIsModalOpen(true)}
        >
          + Добавить запись
        </button>
      </div>

      <DataFilters onFilterChange={handleFilterChange} allData={allData} />

      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      ) : error ? (
        <div className="dashboard-error">
          <p>Ошибка: {error}</p>
          <button onClick={loadData} className="retry-button">
            Повторить
          </button>
        </div>
      ) : (
        <>
          <DataGrid
            data={filteredData}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onRecordDoubleClick={handleRecordDoubleClick}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <AddRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRecordAdded={handleRecordAdded}
      />

      <EditRecordModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRecord(null);
        }}
        onRecordUpdated={handleRecordUpdated}
        record={editingRecord}
      />
    </div>
  );
};

export default Dashboard;
