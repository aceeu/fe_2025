const API_BASE_URL = 'http://localhost:8088';

// Date period helpers
export const getDatePeriod = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch(period) {
    case 'today':
      return {
        fromDate: today,
        toDate: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };

    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        fromDate: yesterday,
        toDate: today
      };

    case 'last_week':
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        fromDate: lastWeek,
        toDate: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };

    case 'last_month':
      const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        fromDate: lastMonth,
        toDate: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };

    case 'current_month':
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        fromDate: firstDayOfMonth,
        toDate: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };

    case 'previous_month':
      const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        fromDate: firstDayOfPrevMonth,
        toDate: lastDayOfPrevMonth
      };

    default:
      // Default to last week
      return getDatePeriod('last_week');
  }
};

// Fetch data with filters
export const fetchData = async (filters = {}) => {
  try {
    const { datePeriod = 'last_week', buyer = '*', category = '*', product = '*' } = filters;

    const { fromDate, toDate } = getDatePeriod(datePeriod);

    const response = await fetch(`${API_BASE_URL}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        filter: {
          buyer,
          category,
          product
        }
      })
    });

    const data = await response.json();

    if (data.res && Array.isArray(data.res)) {
      return {
        success: true,
        data: data.res,
        summary: data.summary || {}
      };
    } else if (data.res === false) {
      throw new Error(data.text || 'Failed to fetch data');
    }

    return { success: true, data: [], summary: {} };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { success: false, error: error.message, data: [], summary: {} };
  }
};

// Fetch categories
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      credentials: 'include'
    });

    const data = await response.json();

    if (data.res && Array.isArray(data.res)) {
      return { success: true, categories: data.res };
    } else {
      throw new Error(data.text || 'Failed to fetch categories');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: error.message, categories: [] };
  }
};

// Get unique buyers from data
export const getUniqueBuyers = (data) => {
  const buyers = new Set();
  data.forEach(item => {
    if (item.buyer) {
      buyers.add(item.buyer);
    }
  });
  return Array.from(buyers).sort();
};

// Edit an existing record
export const editData = async (recordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/editdata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(recordData)
    });

    const data = await response.json();

    if (data.res) {
      return { success: true };
    } else {
      throw new Error(data.text || 'Failed to update record');
    }
  } catch (error) {
    console.error('Error updating record:', error);
    return { success: false, error: error.message };
  }
};

// Add a new record
export const addData = async (recordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/adddata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(recordData)
    });

    const data = await response.json();

    if (data.res) {
      return { success: true };
    } else {
      throw new Error(data.text || 'Failed to add record');
    }
  } catch (error) {
    console.error('Error adding record:', error);
    return { success: false, error: error.message };
  }
};
