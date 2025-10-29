import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import styled, { keyframes } from "styled-components";

// === ANIMATIONS ===
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-50px); }
  to { opacity: 1; transform: translateX(0); }
`;

const bounceIn = keyframes`
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 0.7; transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
`;

const pulseGreen = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(82, 183, 136, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(82, 183, 136, 0); }
  100% { box-shadow: 0 0 0 0 rgba(82, 183, 136, 0); }
`;

// === STYLED COMPONENTS ===
const Container = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #f8fff9 0%, #e8f5e9 100%);
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.header`
  margin-bottom: 30px;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const TitleContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #2d6a4f;
  margin: 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const Subtitle = styled.p`
  color: #52b788;
  margin: 8px 0 0;
  font-size: 1rem;
  font-weight: 500;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(141, 180, 136, 0.15);
  overflow: hidden;
  animation: ${bounceIn} 0.7s ease-out;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
  background: #f1f8f5;
  border-bottom: 1px solid #e0e0e0;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 180px;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #2d6a4f;
  margin-bottom: 6px;
`;

const Input = styled.input`
  padding: 10px 14px;
  border: 1.5px solid #9bc0b4;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #52b788;
    box-shadow: 0 0 0 3px rgba(82, 183, 136, 0.2);
  }
`;

const ResetButton = styled.button`
  align-self: flex-end;
  padding: 10px 18px;
  background: #e0e0e0;
  color: #444;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;

  &:hover {
    background: #d0d0d0;
    transform: translateY(-2px);
  }
`;

const ResultCount = styled.div`
  padding: 12px 20px;
  font-size: 0.95rem;
  color: #2d6a4f;
  background: #f8fff9;
  border-bottom: 1px solid #eee;
`;

const PageNumber = styled.span`
  background: #9bc0b4;
  color: white;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: bold;
  margin: 0 4px;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  background: #f8fff9;
`;

const PrintButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #2d6a4f;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(45, 106, 79, 0.3);

  &:hover {
    background: #1f4d38;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(45, 106, 79, 0.4);
  }

  &:active {
    animation: ${pulseGreen} 0.6s ease-out;
  }
`;

const ExcelButton = styled(PrintButton)`
  background: #52b788;

  &:hover {
    background: #3da676;
    box-shadow: 0 8px 20px rgba(82, 183, 136, 0.4);
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  padding: 0 20px 20px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
  margin-top: -12px;
`;

const Th = styled.th`
  text-align: left;
  padding: 16px 12px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #2d6a4f;
  background: #e8f5e9;
  border-bottom: 2px solid #9bc0b4;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 10;
  cursor: ${({ sortable }) => (sortable ? "pointer" : "default")};

  &:hover {
    background: ${({ sortable }) => (sortable ? "#d0e8d5" : "#e8f5e9")};
    color: ${({ sortable }) => (sortable ? "#1f4d38" : "#2d6a4f")};
  }
`;

const AnimatedTr = styled.tr`
  background: white;
  box-shadow: 0 4px 12px rgba(141, 180, 136, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
  animation: ${slideInLeft} 0.6s ease-out forwards;
  opacity: 0;
  animation-delay: ${({ index }) => `${index * 0.07}s`};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 25px rgba(141, 180, 136, 0.2);
    z-index: 5;
  }

  td:first-child {
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
  }
  td:last-child {
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`;

const Td = styled.td`
  padding: 16px 12px;
  font-size: 0.95rem;
  color: #2d3748;
  background: ${({ even }) => (even ? "#f8fff9" : "white")};

  ${({ noData }) =>
    noData &&
    `
    text-align: center;
    font-style: italic;
    color: #888;
    padding: 40px;
  `}

  ${({ status }) =>
    status === "pending" &&
    `
    background: #fff5f5;
    color: #c53030;
    font-weight: 600;
    text-align: center;
  `}
`;

const BillDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  color: #4a5568;
`;

const BillDetailsText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
  display: block;
`;

const TotalsContainer = styled.div`
  padding: 20px;
  background: #f1f8f5;
  border-top: 1px solid #e0e0e0;
`;

const TotalsCard = styled.div`
  display: flex;
  justify-content: space-around;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(141, 180, 136, 0.12);
  animation: ${fadeInUp} 0.8s ease-out 0.3s both;
`;

const TotalItem = styled.div`
  text-align: center;
  flex: 1;
`;

const TotalLabel = styled.div`
  font-size: 0.9rem;
  color: #2d6a4f;
  font-weight: 600;
  margin-bottom: 8px;
`;

const TotalValue = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ status }) =>
    status === "paid" ? "#059669" : status === "pending" ? "#e74c3c" : "#2d6a4f"};
`;

const TotalDivider = styled.div`
  width: 1px;
  background: #9bc0b4;
  opacity: 0.5;
  margin: 0 20px;
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #f8fff9;
`;

const PaginationButton = styled.button`
  padding: 10px 20px;
  background: ${({ disabled }) => (disabled ? "#e0e0e0" : "#9bc0b4")};
  color: ${({ disabled }) => (disabled ? "#aaa" : "white")};
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;

  &:not(:disabled):hover {
    background: #7aa89a;
    transform: translateY(-2px);
  }
`;

const PageInfo = styled.div`
  font-weight: 600;
  color: #2d6a4f;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px;
  font-size: 1.2rem;
  color: #52b788;
  animation: ${pulseGreen} 1.5s infinite;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 60px;
  font-size: 1.2rem;
  color: #e74c3c;
  background: #fff5f5;
  border-radius: 12px;
  margin: 20px;
`;

// === MAIN COMPONENT ===
const PendingPaymentReport = () => {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL}pending-payments/`
      );
      if (!res.ok) throw new Error("Failed to fetch pending payments data");
      const data = await res.json();

      const processedData = data.map((patient) => {
        let billDetailsArray = [];
        let totalBillAmount = 0;
        let totalAmountPaid = 0;
        let totalRemaining = 0;

        if (patient.bills && patient.bills.length > 0) {
          patient.bills.forEach((bill) => {
            const billDetail = `${bill.billing_no || "-"} / ${
              bill.paid_date || "-"
            } / ${parseFloat(bill.amount_paid || 0).toLocaleString("en-IN")}`;
            billDetailsArray.push(billDetail);
            totalBillAmount += parseFloat(bill.therapy_charge) || 0;
            totalAmountPaid += parseFloat(bill.amount_paid) || 0;
            totalRemaining += parseFloat(bill.remaining_value) || 0;
          });
        } else {
          billDetailsArray.push(
            `- / - / ${parseFloat(patient.amount_pending || 0).toLocaleString(
              "en-IN"
            )}`
          );
          totalBillAmount = parseFloat(patient.therapy_charge) || 0;
          totalAmountPaid = 0;
          totalRemaining = parseFloat(patient.amount_pending) || 0;
        }

        return {
          ...patient,
          billDetailsArray,
          totalBillAmount,
          totalAmountPaid,
          totalRemaining,
        };
      });

      setAllData(processedData);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const processedData = useMemo(() => {
    return allData.map((item) => {
      let ageDisplay = "-";
      if (item.age && typeof item.age === "object") {
        ageDisplay = `${item.age.year || 0}y ${item.age.months || 0}m ${
          item.age.days || 0
        }d`;
      } else if (typeof item.age === "string" || typeof item.age === "number") {
        ageDisplay = item.age;
      }

      const dateObj = item.date ? new Date(item.date) : null;
      const dateTimestamp = dateObj ? dateObj.getTime() : 0;
      const dateDisplay = dateObj ? dateObj.toLocaleDateString() : "-";

      const nameLower = (item.name || "").toLowerCase();
      const regNoLower = (item.registration_number || "").toLowerCase();

      return {
        ...item,
        ageDisplay,
        dateTimestamp,
        dateDisplay,
        nameLower,
        regNoLower,
      };
    });
  }, [allData]);

  const totals = useMemo(() => {
    const filtered = processedData.filter((item) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !item.nameLower.includes(searchLower) &&
          !item.regNoLower.includes(searchLower)
        )
          return false;
      }
      if (filters.startDate && item.dateTimestamp < new Date(filters.startDate).getTime())
        return false;
      if (filters.endDate && item.dateTimestamp > new Date(filters.endDate).getTime())
        return false;
      return true;
    });

    const totalTherapyCharge = filtered.reduce(
      (sum, item) => sum + (item.totalBillAmount || 0),
      0
    );
    const totalAmountPaid = filtered.reduce(
      (sum, item) => sum + (item.totalAmountPaid || 0),
      0
    );
    const totalRemainingValue = filtered.reduce(
      (sum, item) => sum + (item.totalRemaining || 0),
      0
    );

    return {
      totalTherapyCharge: totalTherapyCharge.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      totalAmountPaid: totalAmountPaid.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      totalRemainingValue: totalRemainingValue.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      totalTherapyChargeRaw: totalTherapyCharge,
      totalAmountPaidRaw: totalAmountPaid,
      totalRemainingValueRaw: totalRemainingValue,
    };
  }, [processedData, filters]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = processedData;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.nameLower.includes(searchLower) ||
          item.regNoLower.includes(searchLower)
      );
    }
    if (filters.startDate)
      filtered = filtered.filter(
        (item) => item.dateTimestamp >= new Date(filters.startDate).getTime()
      );
    if (filters.endDate)
      filtered = filtered.filter(
        (item) => item.dateTimestamp <= new Date(filters.endDate).getTime()
      );

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "date") {
          aVal = a.dateTimestamp;
          bVal = b.dateTimestamp;
        } else if (sortConfig.key === "totalRemaining") {
          aVal = a.totalRemaining;
          bVal = b.totalRemaining;
        } else if (sortConfig.key === "totalAmountPaid") {
          aVal = a.totalAmountPaid;
          bVal = b.totalAmountPaid;
        } else if (sortConfig.key === "totalBillAmount") {
          aVal = a.totalBillAmount;
          bVal = b.totalBillAmount;
        } else if (sortConfig.key === "age") {
          aVal = a.ageDisplay;
          bVal = b.ageDisplay;
        }

        if (aVal < bVal)
          return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal)
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [processedData, filters, sortConfig]);

  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(start, start + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "up-down";
    return sortConfig.direction === "asc" ? "up" : "down";
  };

  // === EXCEL EXPORT ===
  const exportToExcel = () => {
    const exportData = filteredAndSortedData.map((item, idx) => ({
      "S.No": (currentPage - 1) * pageSize + idx + 1,
      Date: item.dateDisplay,
      "Registration No": item.registration_number || "-",
      Name: item.name || "-",
      Age: item.ageDisplay,
      Gender: item.gender || "-",
      "Bill Amount": item.totalBillAmount || 0,
      "Amount Paid": item.totalAmountPaid || 0,
      "Remaining Value": item.totalRemaining || 0,
      "Bill Details": item.billDetailsArray.join("\n"),
      Status: "Pending",
    }));

    exportData.push({
      "S.No": "TOTAL",
      Date: "",
      "Registration No": "",
      Name: "",
      Age: "",
      Gender: "",
      "Bill Amount": totals.totalTherapyChargeRaw,
      "Amount Paid": totals.totalAmountPaidRaw,
      "Remaining Value": totals.totalRemainingValueRaw,
      "Bill Details": "",
      Status: "",
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 8 },
      { wch: 12 },
      { wch: 16 },
      { wch: 22 },
      { wch: 12 },
      { wch: 10 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 45 },
      { wch: 12 },
    ];

    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ws[cell_address]) continue;
        const cell = ws[cell_address];

        if (R === 0) {
          cell.s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "9BC0B4" } },
            alignment: {
              horizontal: "center",
              vertical: "center",
              wrapText: true,
            },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            },
          };
        }

        if (R === exportData.length - 1) {
          cell.s = {
            font: { bold: true, color: { rgb: "2D6A4F" } },
            fill: { fgColor: { rgb: "E8F5E9" } },
            alignment: { horizontal: "right" },
            border: { top: { style: "medium", color: { rgb: "9BC0B4" } } },
          };
        }

        if (C >= 6 && C <= 8 && R > 0) {
          cell.z = "₹#,##0.00";
          if (R < exportData.length - 1) {
            cell.s = {
              ...(cell.s || {}),
              font: {
                color: {
                  rgb: C === 8 ? "E74C3C" : C === 7 ? "059669" : "2D6A4F",
                },
              },
            };
          }
        }

        if (C === 9) {
          cell.s = { ...(cell.s || {}), alignment: { wrapText: true, vertical: "top" } };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pending Payments");
    const fileName = `Pending_Payments_Report_${new Date()
      .toISOString()
      .split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success("Excel exported with full formatting!");
  };

  // === PRINT REPORT ===
  const handlePrint = () => {
    const logoUrl = "https://via.placeholder.com/120x60/9BC0B4/FFFFFF?text=LOGO";
    const printWindow = window.open("", "_blank");
    const printContent = `
      <!DOCTYPE html>
      <html><head><title>Pending Payments</title>
      <style>
        @page { margin: 1cm; size: A4 landscape; }
        body { font-family: 'Segoe UI', Arial; margin: 0; padding: 20px; color: #2d3748; }
        .header { text-align: center; margin-bottom: 25px; border-bottom: 3px solid #9bc0b4; padding-bottom: 15px; }
        .logo { height: 50px; margin-bottom: 10px; }
        .title { font-size: 26px; font-weight: 700; color: #2d6a4f; margin: 0; }
        .subtitle { color: #52b788; font-size: 14px; margin: 5px 0; }
        .meta { font-size: 12px; color: #666; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        th { background: #9bc0b4 !important; color: white; font-weight: 700; padding: 10px 8px; text-align: center; text-transform: uppercase; border: 1px solid #8db488; print-color-adjust: exact; }
        td { padding: 10px 8px; border: 1px solid #ddd; vertical-align: top; }
        tr:nth-child(even) td { background: #f8fff9; }
        .amount { text-align: right; font-family: 'Courier New'; }
        .remaining { color: #e74c3c; font-weight: bold; }
        .paid { color: #059669; font-weight: 600; }
        .bill-details { font-size: 10px; color: #4a5568; white-space: pre-line; line-height: 1.4; max-width: 250px; }
        .total-row { background: #e8f5e9 !important; font-weight: bold; font-size: 12px; }
        .total-row td { border-top: 2px solid #9bc0b4; text-align: right; }
        .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #888; border-top: 1px dashed #ccc; padding-top: 10px; }
      </style></head><body>
        <div class="header">
          <img src="${logoUrl}" class="logo">
          <h1 class="title">PENDING PAYMENTS REPORT</h1>
          <p class="subtitle">Financial Summary - All Pending Dues</p>
          <div class="meta">
            Generated: ${new Date().toLocaleString()}
            ${filters.search ? ` | Search: ${filters.search}` : ""}
            ${
              filters.startDate
                ? ` | Period: ${filters.startDate} to ${
                    filters.endDate || "Today"
                  }`
                : ""
            }
          </div>
        </div>
        <table>
          <thead><tr>
            <th>S.No</th><th>Date</th><th>Reg No</th><th>Name</th><th>Age</th><th>Gender</th>
            <th class="amount">Bill Amount</th><th class="amount">Amount Paid</th><th class="amount">Remaining</th>
            <th>Bill Details</th><th>Status</th>
          </tr></thead><tbody>
          ${filteredAndSortedData.map((item, i) => `
            <tr>
              <td style="text-align:center">${(currentPage - 1) * pageSize + i + 1}</td>
              <td>${item.dateDisplay}</td>
              <td>${item.registration_number || "-"}</td>
              <td>${item.name || "-"}</td>
              <td style="text-align:center">${item.ageDisplay}</td>
              <td style="text-align:center">${item.gender || "-"}</td>
              <td class="amount">${item.totalBillAmount?.toLocaleString("en-IN", {minimumFractionDigits: 2})}</td>
              <td class="amount paid">${item.totalAmountPaid?.toLocaleString("en-IN", {minimumFractionDigits: 2})}</td>
              <td class="amount remaining">${item.totalRemaining?.toLocaleString("en-IN", {minimumFractionDigits: 2})}</td>
              <td class="bill-details">${item.billDetailsArray.join("\n")}</td>
              <td style="text-align:center;color:#c53030;font-weight:600;">Pending</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="6" style="text-align:right;font-weight:bold;">GRAND TOTAL</td>
            <td class="amount">₹${totals.totalTherapyCharge}</td>
            <td class="amount paid">₹${totals.totalAmountPaid}</td>
            <td class="amount remaining">₹${totals.totalRemainingValue}</td>
            <td colspan="2"></td>
          </tr>
          </tbody></table>
        <div class="footer">Total Records: ${filteredAndSortedData.length} | Generated by Dashboard v2.0</div>
      </body></html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    toast.success("Print preview opened!");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  if (loading) return <LoadingMessage>Loading pending payments...</LoadingMessage>;
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
            <Input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Enter name or reg no"
            />
          </FilterGroup>
          <FilterGroup>
            <Label>Start Date:</Label>
            <Input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </FilterGroup>
          <FilterGroup>
            <Label>End Date:</Label>
            <Input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </FilterGroup>
          <ResetButton
            onClick={() => {
              setFilters({ search: "", startDate: "", endDate: "" });
              setCurrentPage(1);
            }}
          >
            Reset Filters
          </ResetButton>
        </FiltersContainer>

        <ResultCount>
          Showing <strong>{paginatedData.length}</strong> of{" "}
          <strong>{totalItems}</strong> records (Page{" "}
          <PageNumber>{currentPage}</PageNumber> of {totalPages || 1})
        </ResultCount>

        <ActionButtonsContainer>
          <PrintButton onClick={handlePrint}>Print Report</PrintButton>
          <ExcelButton onClick={exportToExcel}>Export Excel</ExcelButton>
        </ActionButtonsContainer>

        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <Th>S.No</Th>
                <Th onClick={() => requestSort("date")} sortable>
                  Date {getSortIcon("date")}
                </Th>
                <Th onClick={() => requestSort("registration_number")} sortable>
                  Registration No {getSortIcon("registration_number")}
                </Th>
                <Th onClick={() => requestSort("name")} sortable>
                  Name {getSortIcon("name")}
                </Th>
                <Th onClick={() => requestSort("age")} sortable>
                  Age {getSortIcon("age")}
                </Th>
                <Th onClick={() => requestSort("gender")} sortable>
                  Gender {getSortIcon("gender")}
                </Th>
                <Th onClick={() => requestSort("totalBillAmount")} sortable>
                  Bill Amount {getSortIcon("totalBillAmount")}
                </Th>
                <Th onClick={() => requestSort("totalAmountPaid")} sortable>
                  Amount Paid {getSortIcon("totalAmountPaid")}
                </Th>
                <Th onClick={() => requestSort("totalRemaining")} sortable>
                  Remaining Value {getSortIcon("totalRemaining")}
                </Th>
                <Th>Bill Details</Th>
                {/* <Th>Status</Th> */}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => {
                  const serialNo = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <AnimatedTr key={index} index={index}>
                      <Td>{serialNo}</Td>
                      <Td>{item.dateDisplay}</Td>
                      <Td>{item.registration_number || "-"}</Td>
                      <Td>{item.name || "-"}</Td>
                      <Td>{item.ageDisplay}</Td>
                      <Td>{item.gender || "-"}</Td>
                      <Td>
                        {item.totalBillAmount
                          ? item.totalBillAmount.toLocaleString("en-IN")
                          : "-"}
                      </Td>
                      <Td style={{ color: "#059669", fontWeight: "600" }}>
                        {item.totalAmountPaid
                          ? item.totalAmountPaid.toLocaleString("en-IN")
                          : 0}
                      </Td>
                      <Td
                        style={{
                          color:
                            item.totalRemaining > 0 ? "#e74c3c" : "#10b981",
                          fontWeight: "bold",
                        }}
                      >
                        {item.totalRemaining
                          ? item.totalRemaining.toLocaleString("en-IN")
                          : 0}
                      </Td>
                      <Td>
                        <BillDetailsContainer>
                          {item.billDetailsArray.map((detail, idx) => (
                            <BillDetailsText key={idx}>{detail}</BillDetailsText>
                          ))}
                        </BillDetailsContainer>
                      </Td>
                      {/* <Td status="pending">Pending</Td> */}
                    </AnimatedTr>
                  );
                })
              ) : (
                <tr>
                  <Td colSpan={11} noData>
                    No pending payments found
                  </Td>
                </tr>
              )}
            </tbody>
          </StyledTable>
        </TableContainer>

        <TotalsContainer>
          <TotalsCard>
            <TotalItem>
              <TotalLabel>Total Bill Amount</TotalLabel>
              <TotalValue>{totals.totalTherapyCharge}</TotalValue>
            </TotalItem>
            <TotalDivider />
            <TotalItem>
              <TotalLabel>Total Amount Paid</TotalLabel>
              <TotalValue status="paid">{totals.totalAmountPaid}</TotalValue>
            </TotalItem>
            <TotalDivider />
            <TotalItem>
              <TotalLabel>Total Remaining Value</TotalLabel>
              <TotalValue status="pending">
                {totals.totalRemainingValue}
              </TotalValue>
            </TotalItem>
          </TotalsCard>
        </TotalsContainer>

        {totalPages > 1 && (
          <PaginationWrapper>
            <PaginationButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </PaginationButton>
            <PageInfo>
              Page <PageNumber>{currentPage}</PageNumber> of {totalPages}
            </PageInfo>
            <PaginationButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </PaginationButton>
          </PaginationWrapper>
        )}
      </ContentCard>
    </Container>
  );
};

export default PendingPaymentReport;