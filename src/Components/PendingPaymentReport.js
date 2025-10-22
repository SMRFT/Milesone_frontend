import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
import styled, { keyframes } from "styled-components";

// Bold animations with green theme
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const bounceIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const pulseGreen = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
`;

const PendingPayments = () => {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filtering state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    startDate: '',
    endDate: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchData = async () => {
    try {
      const [res1, res2] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL}pending-payments/`),
        fetch(`${process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL}pendingPayment/`),
      ]);

      if (!res1.ok || !res2.ok) throw new Error("Failed to fetch one or more APIs");

      const data1 = await res1.json();
      const data2 = await res2.json();

      const mergedArray = [...data1, ...data2];

      setAllData(mergedArray);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // Process and format data
  const processedData = useMemo(() => {
    return allData.map(item => {
      let ageDisplay = "-";
      if (item.age && typeof item.age === "object") {
        ageDisplay = `${item.age.year || 0}y ${item.age.months || 0}m ${item.age.days || 0}d`;
      } else if (typeof item.age === 'string' || typeof item.age === 'number') {
        ageDisplay = item.age;
      }

      const amountPendingRaw = item.remaining_amount?.value ?? item.therapy_charge ?? 0;
      const amountPending = parseFloat(amountPendingRaw) || 0;

      const billNo = item.remaining_amount?.new_bill_no ?? item.billing_no ?? "-";

      const dateObj = item.date ? new Date(item.date) : null;
      const dateTimestamp = dateObj ? dateObj.getTime() : 0;
      const dateDisplay = dateObj ? dateObj.toLocaleDateString() : "-";

      const nameLower = (item.name || "").toLowerCase();
      const regNoLower = (item.registration_number || "").toLowerCase();

      return {
        ...item,
        ageDisplay,
        amountPending,
        billNo,
        dateTimestamp,
        dateDisplay,
        nameLower,
        regNoLower,
      };
    });
  }, [allData]);

  // Calculate totals for filtered data
  const totals = useMemo(() => {
    const filteredData = processedData.filter(item => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!item.nameLower.includes(searchLower) && !item.regNoLower.includes(searchLower)) {
          return false;
        }
      }
      if (filters.startDate) {
        const start = new Date(filters.startDate).getTime();
        if (item.dateTimestamp < start) return false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate).getTime();
        if (item.dateTimestamp > end) return false;
      }
      return true;
    });

    const totalTherapyCharge = filteredData.reduce((sum, item) => {
      return sum + (parseFloat(item.therapy_charge) || 0);
    }, 0);

    const totalAmountPending = filteredData.reduce((sum, item) => {
      return sum + item.amountPending;
    }, 0);

    return {
      totalTherapyCharge: totalTherapyCharge.toLocaleString('en-IN', { 
        maximumFractionDigits: 2, 
        minimumFractionDigits: 2 
      }),
      totalAmountPending: totalAmountPending.toLocaleString('en-IN', { 
        maximumFractionDigits: 2, 
        minimumFractionDigits: 2 
      }),
      totalTherapyChargeRaw: totalTherapyCharge,
      totalAmountPendingRaw: totalAmountPending
    };
  }, [processedData, filters]);

  // Apply filters and sorting
  const filteredAndSortedData = useMemo(() => {
    let filtered = processedData;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.nameLower.includes(searchLower) || item.regNoLower.includes(searchLower)
      );
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      filtered = filtered.filter(item => item.dateTimestamp >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      filtered = filtered.filter(item => item.dateTimestamp <= end);
    }

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'date') {
          aVal = a.dateTimestamp;
          bVal = b.dateTimestamp;
        } else if (sortConfig.key === 'amountPending') {
          aVal = a.amountPending;
          bVal = b.amountPending;
        } else if (sortConfig.key === 'age') {
          aVal = a.ageDisplay;
          bVal = b.ageDisplay;
        } else if (sortConfig.key === 'registration_number') {
          aVal = a.registration_number || "";
          bVal = b.registration_number || "";
        } else if (sortConfig.key === 'name') {
          aVal = a.name || "";
          bVal = b.name || "";
        } else if (sortConfig.key === 'therapy_charge') {
          aVal = parseFloat(a.therapy_charge) || 0;
          bVal = parseFloat(b.therapy_charge) || 0;
        } else if (sortConfig.key === 'billNo') {
          aVal = a.billNo;
          bVal = b.billNo;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [processedData, filters, sortConfig]);

  // Pagination logic
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredAndSortedData.slice(start, end);
  }, [filteredAndSortedData, currentPage, pageSize]);

  // EXPORT EXCEL FUNCTION
  const exportToExcel = () => {
    const exportData = filteredAndSortedData.map(item => ({
      'S.No': filteredAndSortedData.indexOf(item) + 1,
      'Date': item.dateDisplay,
      'Registration No': item.registration_number || '-',
      'Name': item.name || '-',
      'Age': item.ageDisplay,
      'Gender': item.sex || item.gender || '-',
      'Therapy Charge': parseFloat(item.therapy_charge) || 0,
      'Amount Pending': item.amountPending,
      'Bill No': item.billNo,
      'Status': 'Pending'
    }));

    // Add totals row
    exportData.push({
      'S.No': '',
      'Date': '',
      'Registration No': '',
      'Name': '',
      'Age': '',
      'Gender': '',
      'Therapy Charge': totals.totalTherapyChargeRaw,
      'Amount Pending': totals.totalAmountPendingRaw,
      'Bill No': '',
      'Status': 'TOTAL'
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-fit columns
    const colWidths = [
      { wch: 8 }, // S.No
      { wch: 12 }, // Date
      { wch: 15 }, // Registration No
      { wch: 20 }, // Name
      { wch: 10 }, // Age
      { wch: 10 }, // Gender
      { wch: 15 }, // Therapy Charge
      { wch: 15 }, // Amount Pending
      { wch: 12 }, // Bill No
      { wch: 10 }  // Status
    ];
    ws['!cols'] = colWidths;

    // Style totals row
    const lastRow = exportData.length;
    ws[XLSX.utils.encode_cell({ r: lastRow - 1, c: 0 })].s = {
      font: { bold: true, color: { rgb: "FF0000" } },
      fill: { fgColor: { rgb: "FFFF00" } }
    };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pending Payments");
    
    const fileName = `Pending_Payments_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success('Excel file exported successfully!');
  };

  // PRINT FUNCTION
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pending Payments Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #2c5aa0; }
          .date { color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .amount-pending { color: red; font-weight: bold; }
          .total-row { background-color: #f0f8ff; font-weight: bold; }
          .totals { margin-top: 30px; text-align: right; }
          .total-label { font-weight: bold; margin-right: 10px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">PENDING PAYMENTS REPORT</div>
          <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
          ${filters.search && `<div>Search: ${filters.search}</div>`}
          ${filters.startDate && `<div>Date Range: ${filters.startDate} to ${filters.endDate || 'Present'}</div>`}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Registration No</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Therapy Charge</th>
              <th>Amount Pending</th>
              <th>Bill No</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredAndSortedData.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.dateDisplay}</td>
                <td>${item.registration_number || '-'}</td>
                <td>${item.name || '-'}</td>
                <td>${item.ageDisplay}</td>
                <td>${item.sex || item.gender || '-'}</td>
                <td>${parseFloat(item.therapy_charge) || 0}</td>
                <td class="amount-pending">${item.amountPending}</td>
                <td>${item.billNo}</td>
                <td>Pending</td>
              </tr>
            `).join('')}
            <tr class="total-row">
            <td colspan="1">TOTAL</td>
              <td colspan="5"></td>
              <td>${totals.totalTherapyChargeRaw.toLocaleString('en-IN')}</td>
              <td>${totals.totalAmountPendingRaw.toLocaleString('en-IN')}</td>
             <td colspan="7"></td>
            </tr>
          </tbody>
        </table>
        
        <div class="totals">
          <div><span class="total-label">Total Records:</span> ${filteredAndSortedData.length}</div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    // printWindow.close();
    
    toast.success('Print preview opened!');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) return <LoadingMessage>Loading...</LoadingMessage>;
  if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <TitleContent>
            <Title>PENDING PAYMENTS REPORT</Title>
            <Subtitle>Manage and track all pending payments efficiently</Subtitle>
          </TitleContent>
        </TitleWrapper>
      </Header>

      <ContentCard>
        <FiltersContainer>
          <FilterGroup>
            <Label>Search (Name/Reg No):</Label>
            <Input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Enter name or reg no" />
          </FilterGroup>
          <FilterGroup>
            <Label>Start Date:</Label>
            <Input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </FilterGroup>
          <FilterGroup>
            <Label>End Date:</Label>
            <Input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </FilterGroup>
          <ResetButton onClick={() => {
            setFilters({ search: '', status: 'all', startDate: '', endDate: '' });
            setCurrentPage(1);
          }}>
            Reset Filters
          </ResetButton>
        </FiltersContainer>

        <ResultCount>
          Showing <strong>{paginatedData.length}</strong> of <strong>{totalItems}</strong> records (Page <PageNumber>{currentPage}</PageNumber> of {totalPages || 1})
        </ResultCount>

        {/* ACTION BUTTONS */}
        <ActionButtonsContainer>
          <PrintButton onClick={handlePrint}>
            🖨️ Print Report
          </PrintButton>
          <ExcelButton onClick={exportToExcel}>
            📊 Export Excel
          </ExcelButton>
        </ActionButtonsContainer>

        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <Th>S.No</Th>
                <Th onClick={() => requestSort('date')} sortable>
                  Date {getSortIcon('date')}
                </Th>
                <Th onClick={() => requestSort('registration_number')} sortable>
                  Registration No {getSortIcon('registration_number')}
                </Th>
                <Th onClick={() => requestSort('name')} sortable>
                  Name {getSortIcon('name')}
                </Th>
                <Th onClick={() => requestSort('age')} sortable>
                  Age {getSortIcon('age')}
                </Th>
                <Th onClick={() => requestSort('sex')} sortable>
                  Gender {getSortIcon('sex')}
                </Th>
                <Th onClick={() => requestSort('therapy_charge')} sortable>
                  Therapy Charge {getSortIcon('therapy_charge')}
                </Th>
                <Th onClick={() => requestSort('amountPending')} sortable>
                  Amount Pending {getSortIcon('amountPending')}
                </Th>
                <Th onClick={() => requestSort('billNo')} sortable>
                  Bill No {getSortIcon('billNo')}
                </Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => {
                  const serialNo = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <AnimatedTr key={index} index={index} even={index % 2 === 0}>
                      <Td>{serialNo}</Td>
                      <Td>{item.dateDisplay}</Td>
                      <Td>{item.registration_number || "-"}</Td>
                      <Td>{item.name || "-"}</Td>
                      <Td>{item.ageDisplay}</Td>
                      <Td>{item.sex || item.gender || "-"}</Td>
                      <Td>{item.therapy_charge ?? "-"}</Td>
                      <Td style={{ color: item.amountPending > 0 ? "#e74c3c" : "#10b981", fontWeight: "bold" }}>
                        {item.amountPending}
                      </Td>
                      <Td>{item.billNo}</Td>
                      <Td status="pending">Pending</Td>
                    </AnimatedTr>
                  );
                })
              ) : (
                <Tr>
                  <Td colSpan="10" noData>
                    No pending payments found matching the filters
                  </Td>
                </Tr>
              )}
            </tbody>
          </StyledTable>
        </TableContainer>

        {/* TOTALS SECTION */}
        <TotalsContainer>
          <TotalsCard>
            <TotalItem>
              <TotalLabel>Total Therapy Billing</TotalLabel>
              <TotalValue>{totals.totalTherapyCharge}</TotalValue>
            </TotalItem>
            <TotalDivider />
            <TotalItem>
              <TotalLabel>Total Amount Pending</TotalLabel>
              <TotalValue status="pending">{totals.totalAmountPending}</TotalValue>
            </TotalItem>
          </TotalsCard>
        </TotalsContainer>

        {totalPages > 1 && (
          <PaginationWrapper>
            <PaginationButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </PaginationButton>
            <PageInfo>
              Page <PageNumber>{currentPage}</PageNumber> of {totalPages}
            </PageInfo>
            <PaginationButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </PaginationButton>
          </PaginationWrapper>
        )}
      </ContentCard>
    </Container>
  );
};

export default PendingPayments;

// ... (All existing styled components remain the same until ActionButtonsContainer)

// NEW ACTION BUTTONS STYLED COMPONENTS
const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin: 2rem 0;
  animation: ${fadeInUp} 1.3s ease-out;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PrintButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #6fbef2ff 0%, #487898ff 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ExcelButton = styled.button`
  display: flex ;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #b0ebc9ff 0%, #66977aff 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(46, 204, 113, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

// ... (All other existing styled components remain exactly the same)

// Styled Components with theme integration and bold animations
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #8db488a1 0%, #9bc0b4ff 100%);
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-style:Times New Roman;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
  animation: ${slideInLeft} 0.6s ease-out;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: white;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const TitleContent = styled.div`
  animation: ${fadeInUp} 0.7s ease-out;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.05rem;
  margin: 0.5rem 0 0;
  opacity: 0.95;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: ${fadeInUp} 0.8s ease-out;

  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 16px;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f0fdf4;
  border-radius: 16px;
  border: 2px solid #a6dbb5b5;
  animation: ${fadeInUp} 0.9s ease-out;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 200px;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  background: #f9fafb;

  &:focus {
    outline: none;
    border-color: #9bc0b4ff;
    background: white;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    animation: ${pulseGreen} 1s infinite;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ResetButton = styled.button`
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(245, 108, 93, 1) 0%, rgba(245, 87, 69, 1) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(231, 76, 60, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ResultCount = styled.div`
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 1s ease-out;

  strong {
    color: #9bc0b4ff;
    font-weight: 700;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  margin-bottom: 20px;
  animation: ${fadeInUp} 1.1s ease-out;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
`;

const Th = styled.th`
  background: linear-gradient(135deg, #9bc0b4ff 0%, #8db488a1 100%);
  color: #fff;
  padding: 1.25rem 1rem;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
  transition: background 0.3s ease;

  ${props => props.sortable && `
    cursor: pointer;
    user-select: none;

    &:hover {
      background: linear-gradient(135deg, #9bc0b4ff 0%, rgba(5, 93, 68, 1)a1 100%);
    }
  `}
`;

const Tr = styled.tr`
  background-color: ${props => (props.even ? '#f0fdf4' : '#fff')};
  transition: all 0.3s ease;

  &:hover {
    background-color: #ecfdf5;
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
  }
`;

const AnimatedTr = styled(Tr)`
  animation: ${fadeInUp} 0.5s ease-out both;
  animation-delay: ${props => (props.index || 0) * 0.05}s;
`;

const Td = styled.td`
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #333;
  font-size: 1rem;

  ${props => props.noData && `
    text-align: center;
    color: #777;
    font-style: Times New Roman;
    padding: 60px 0;
    font-size: 1.1rem;
  `}

  ${props => props.status === 'pending' && `
    color: #e74c3c;
    font-weight: bold;
  `}
`;

// NEW TOTALS STYLED COMPONENTS
const TotalsContainer = styled.div`
  margin-bottom: 2rem;
  animation: ${fadeInUp} 1.2s ease-out;
`;

const TotalsCard = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 2px solid #9bc0b4ff;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2rem;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
`;

const TotalItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
`;

const TotalLabel = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TotalValue = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${props => props.status === 'pending' ? 'rgba(249, 112, 97, 1)' : 'hsla(160, 24%, 54%, 1.00)'};
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const TotalDivider = styled.div`
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, #9bc0b4ff, #8db488a1);
  border-radius: 1px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
  animation: ${fadeInUp} 1.3s ease-out;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: ${props => props.disabled ? '#e5e7eb' : 'linear-gradient(135deg, #9bc0b4ff 0%, #8db488a1 100%)'};
  color: ${props => props.disabled ? '#9ca3af' : 'white'};
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
  }
`;

const PageInfo = styled.div`
  font-size: 1.1rem;
  color: #6b7280;
  font-weight: 500;
`;

const PageNumber = styled.span`
  color: #10b981df;
  font-weight: 700;
  font-size: 1.2rem;
`;

const LoadingMessage = styled.p`
  text-align: center;
  font-size: 1.8rem;
  color: #9bc0b4ff;
  margin-top: 50px;
  animation: ${pulseGreen} 1.5s infinite;
`;

const ErrorMessage = styled.p`
  text-align: center;
  font-size: 1.8rem;
  color: #e74c3c;
  margin-top: 50px;
  animation: ${bounceIn} 0.5s ease-out;
`;