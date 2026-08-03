import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  HelpCircle,
  MessageSquare,
  Plus,
  Search,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Filter,
  Send,
  X,
  Tag,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

const QnaPage = () => {
  const [qnaList, setQnaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("last_week"); // "last_week" | "all" | "unanswered" | "answered"
  
  // Ask Question Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newAskedBy, setNewAskedBy] = useState("");
  const [newRegNo, setNewRegNo] = useState("");
  const [newInitialAnswer, setNewInitialAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Patient Auto-complete list
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Inline Answer Input State (keyed by qa_id)
  const [answerInputs, setAnswerInputs] = useState({});
  const [answerAuthorInputs, setAnswerAuthorInputs] = useState({});
  const [submittingAnswerId, setSubmittingAnswerId] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const categories = [
    "General",
    "Occupational Therapy",
    "Speech Therapy",
    "Applied Behavior Analysis (ABA)",
    "Physiotherapy",
    "Clinical Psychology",
    "Pediatric",
    "Developmental",
    "Administrative"
  ];

  useEffect(() => {
    fetchQnaList();
    fetchPatients();
    
    // Set default author name from logged in user
    const loggedName = localStorage.getItem("name") || localStorage.getItem("employeeName") || "Staff";
    setNewAskedBy(loggedName);
  }, [filterType]);

  const userRole = localStorage.getItem("role") || "";

  if (userRole.toLowerCase() === "receptionist") {
    return (
      <Container style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <EmptyState style={{ maxWidth: "500px" }}>
          <AlertCircle size={64} style={{ color: "#ef4444", marginBottom: "1rem" }} />
          <h3 style={{ color: "#991b1b" }}>Access Restricted</h3>
          <p style={{ color: "#7f1d1d" }}>The Q&A page is accessible for Admin and PDC roles only.</p>
        </EmptyState>
      </Container>
    );
  }

  const fetchQnaList = async () => {
    setLoading(true);
    try {
      const url = `${Milestonebaseurl}qna/list/?filter=${filterType}`;
      const response = await apiRequest(url, "GET");
      if (response && response.success) {
        setQnaList(response.data.data || []);
      } else {
        toast.error(response?.message || "Failed to load Q&A records");
      }
    } catch (error) {
      toast.error("Failed to load Q&A records");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await apiRequest(`${Milestonebaseurl}all-patient-filterless/`, "GET");
      if (response && response.success) {
        setPatients(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load patient list", error);
    }
  };

  const handlePatientSelect = (p) => {
    setNewRegNo(p.registration_number);
    setPatientSearch(`${p.name_of_child} (${p.registration_number})`);
    setShowPatientDropdown(false);
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      toast.warning("Please enter a question");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        question: newQuestion.trim(),
        category: newCategory,
        asked_by: newAskedBy.trim() || "Anonymous",
        registration_number: newRegNo.trim(),
        initial_answer: newInitialAnswer.trim(),
        "auth-user-id": localStorage.getItem("employeeId") || localStorage.getItem("auth-user-id") || "Admin"
      };

      const response = await apiRequest(`${Milestonebaseurl}qna/create/`, "POST", payload);
      if (response && response.success) {
        const createdQaId = response.data?.data?.qa_id || "New Question";
        toast.success(`Question created! Sequence ID: ${createdQaId}`);
        setIsModalOpen(false);
        setNewQuestion("");
        setNewCategory("General");
        setNewRegNo("");
        setPatientSearch("");
        setNewInitialAnswer("");
        fetchQnaList();
      } else {
        toast.error(response?.error || response?.message || "Failed to create question");
      }
    } catch (error) {
      toast.error("Failed to create question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAnswerSubmit = async (qa_id) => {
    const ansText = (answerInputs[qa_id] || "").trim();
    if (!ansText) {
      toast.warning("Please type an answer before submitting");
      return;
    }

    const defaultAuthor = localStorage.getItem("name") || localStorage.getItem("employeeName") || "Staff";
    const authorText = (answerAuthorInputs[qa_id] || defaultAuthor).trim();

    setSubmittingAnswerId(qa_id);
    try {
      const payload = {
        qa_id: qa_id,
        answer: ansText,
        answered_by: authorText,
        "auth-user-id": localStorage.getItem("employeeId") || localStorage.getItem("auth-user-id") || "Admin"
      };

      const response = await apiRequest(`${Milestonebaseurl}qna/add-answer/`, "POST", payload);
      if (response && response.success) {
        toast.success(`Answer added to ${qa_id}`);
        setAnswerInputs((prev) => ({ ...prev, [qa_id]: "" }));
        fetchQnaList();
      } else {
        toast.error(response?.error || response?.message || "Failed to add answer");
      }
    } catch (error) {
      toast.error("Failed to add answer");
    } finally {
      setSubmittingAnswerId(null);
    }
  };

  // Search filtering
  const filteredQnaList = qnaList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.qa_id?.toLowerCase().includes(q) ||
      item.question?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.asked_by?.toLowerCase().includes(q) ||
      item.registration_number?.toLowerCase().includes(q) ||
      item.patient_name?.toLowerCase().includes(q) ||
      item.answers?.some(a => a.answer?.toLowerCase().includes(q) || a.answered_by?.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredQnaList.length / PAGE_SIZE);
  const displayedQnaList = filteredQnaList.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const filteredPatients = patients.filter((p) => {
    const q = patientSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      p.registration_number?.toLowerCase().includes(q) ||
      p.name_of_child?.toLowerCase().includes(q)
    );
  });

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <IconWrapper>
            <HelpCircle size={44} strokeWidth={2} />
          </IconWrapper>
          <TitleContent>
            <Title>Q&A Page</Title>
            <Subtitle>Ask questions, post answers, and track Q&A threads (Default: Last 1 Week Data)</Subtitle>
          </TitleContent>
        </TitleWrapper>
        <AskButton onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Ask Question
        </AskButton>
      </Header>

      <FilterCard>
        <FilterRow>
          <SearchBox>
            <Search size={18} style={{ color: "#6b7280" }} />
            <SearchInput
              type="text"
              placeholder="Search by Q026/0000001, question, patient, or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <ClearSearch onClick={() => setSearchQuery("")}>
                <X size={16} />
              </ClearSearch>
            )}
          </SearchBox>

          <FilterTabs>
            <TabButton
              active={filterType === "last_week"}
              onClick={() => { setFilterType("last_week"); setCurrentPage(1); }}
            >
              <Calendar size={16} />
              Last 1 Week
            </TabButton>
            <TabButton
              active={filterType === "all"}
              onClick={() => { setFilterType("all"); setCurrentPage(1); }}
            >
              <Filter size={16} />
              All Time
            </TabButton>
            <TabButton
              active={filterType === "unanswered"}
              onClick={() => { setFilterType("unanswered"); setCurrentPage(1); }}
            >
              <Clock size={16} />
              Unanswered
            </TabButton>
            <TabButton
              active={filterType === "answered"}
              onClick={() => { setFilterType("answered"); setCurrentPage(1); }}
            >
              <CheckCircle size={16} />
              Answered
            </TabButton>
          </FilterTabs>
        </FilterRow>
      </FilterCard>

      {/* Main Questions Feed */}
      {loading ? (
        <LoadingState>
          <Spinner />
          <p>Loading Q&A threads...</p>
        </LoadingState>
      ) : displayedQnaList.length === 0 ? (
        <EmptyState>
          <MessageCircle size={64} style={{ color: "#a1c181", marginBottom: "1rem" }} />
          <h3>No Questions Found</h3>
          <p>
            {filterType === "last_week"
              ? "No Q&A records were created in the last 7 days. Click 'All Time' or ask a new question!"
              : "No questions match your current search or filter."}
          </p>
          <AskButton style={{ marginTop: "1rem" }} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Ask Question Now
          </AskButton>
        </EmptyState>
      ) : (
        <>
          <QuestionsFeed>
            {displayedQnaList.map((item) => (
              <QuestionCard key={item.qa_id}>
                <CardTopHeader>
                  <SequenceBadge>{item.qa_id}</SequenceBadge>
                  <CategoryBadge>{item.category || "General"}</CategoryBadge>
                  <StatusPill className={item.status === "Answered" ? "answered" : "unanswered"}>
                    {item.status === "Answered" ? (
                      <>
                        <CheckCircle size={14} /> Answered ({item.answer_count})
                      </>
                    ) : (
                      <>
                        <Clock size={14} /> Unanswered
                      </>
                    )}
                  </StatusPill>
                  <Timestamp>{item.created_date}</Timestamp>
                </CardTopHeader>

                <QuestionBody>
                  <QuestionText>{item.question}</QuestionText>
                  <MetaRow>
                    <MetaItem>
                      <User size={15} />
                      <span>Asked by: <strong>{item.asked_by || "Anonymous"}</strong></span>
                    </MetaItem>

                    {item.registration_number && (
                      <MetaItem>
                        <Tag size={15} />
                        <span>Child: <strong>{item.patient_name || item.registration_number} ({item.registration_number})</strong></span>
                      </MetaItem>
                    )}
                  </MetaRow>
                </QuestionBody>

                {/* Answers Section */}
                <AnswersContainer>
                  <AnswersHeader>
                    <MessageSquare size={16} />
                    <span>Answers ({item.answers ? item.answers.length : 0})</span>
                  </AnswersHeader>

                  {item.answers && item.answers.length > 0 ? (
                    <AnswersList>
                      {item.answers.map((ans, aIdx) => (
                        <AnswerBubble key={aIdx}>
                          <AnswerHeaderRow>
                            <AnswerAuthor>
                              <User size={14} /> {ans.answered_by || "Staff"}
                            </AnswerAuthor>
                            <AnswerIdBadge>{ans.answer_id}</AnswerIdBadge>
                            <AnswerTime>{ans.answered_date}</AnswerTime>
                          </AnswerHeaderRow>
                          <AnswerContent>{ans.answer}</AnswerContent>
                        </AnswerBubble>
                      ))}
                    </AnswersList>
                  ) : (
                    <NoAnswersText>No answers posted yet. Add an answer below!</NoAnswersText>
                  )}

                  {/* Add Answer Box */}
                  <AddAnswerBox>
                    <AddAnswerHeader>Add an Answer</AddAnswerHeader>
                    <AnswerInputGroup>
                      <AnswerTextArea
                        rows="2"
                        placeholder="Write your answer here..."
                        value={answerInputs[item.qa_id] || ""}
                        onChange={(e) => setAnswerInputs({ ...answerInputs, [item.qa_id]: e.target.value })}
                      />
                      <AnswerFormFooter>
                        <AuthorInput
                          type="text"
                          placeholder="Answered by (Name)"
                          value={answerAuthorInputs[item.qa_id] !== undefined ? answerAuthorInputs[item.qa_id] : (localStorage.getItem("name") || "")}
                          onChange={(e) => setAnswerAuthorInputs({ ...answerAuthorInputs, [item.qa_id]: e.target.value })}
                        />
                        <SubmitAnswerBtn
                          onClick={() => handleAddAnswerSubmit(item.qa_id)}
                          disabled={submittingAnswerId === item.qa_id}
                        >
                          <Send size={14} />
                          {submittingAnswerId === item.qa_id ? "Submitting..." : "Submit Answer"}
                        </SubmitAnswerBtn>
                      </AnswerFormFooter>
                    </AnswerInputGroup>
                  </AddAnswerBox>
                </AnswersContainer>
              </QuestionCard>
            ))}
          </QuestionsFeed>

          {/* Pagination */}
          {totalPages > 1 && (
            <PaginationWrapper>
              <PaginationButton
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={18} />
                Previous
              </PaginationButton>
              <PageInfo>
                Page <PageNumber>{currentPage}</PageNumber> of <PageNumber>{totalPages}</PageNumber>
              </PageInfo>
              <PaginationButton
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
                <ChevronRight size={18} />
              </PaginationButton>
            </PaginationWrapper>
          )}
        </>
      )}

      {/* Ask Question Modal */}
      {isModalOpen && (
        <ModalBackdrop onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <HelpCircle size={24} style={{ color: "#557153" }} />
                Ask New Question
              </ModalTitle>

              <CloseModalButton onClick={() => setIsModalOpen(false)}>
                <X size={22} />
              </CloseModalButton>
            </ModalHeader>

            <form onSubmit={handleCreateQuestion}>
              <ModalBody>
                <FormGroup>
                  <FormLabel>Category</FormLabel>
                  <FormSelect
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </FormSelect>
                </FormGroup>

                <FormGroup>
                  <FormLabel>Question *</FormLabel>
                  <FormTextArea
                    rows="4"
                    placeholder="Type your question here in detail..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup style={{ position: "relative" }}>
                  <FormLabel>Link Child / Registration No (Optional)</FormLabel>
                  <FormInput
                    type="text"
                    placeholder="Type name or reg no to search patient..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                  />
                  {showPatientDropdown && filteredPatients.length > 0 && (
                    <PatientDropdownList>
                      {filteredPatients.slice(0, 8).map((p) => (
                        <PatientDropdownItem
                          key={p.registration_number}
                          onClick={() => handlePatientSelect(p)}
                        >
                          <strong>{p.name_of_child}</strong>
                          <span>({p.registration_number})</span>
                        </PatientDropdownItem>
                      ))}
                    </PatientDropdownList>
                  )}
                </FormGroup>

                <FormGroup>
                  <FormLabel>Asked By</FormLabel>
                  <FormInput
                    type="text"
                    placeholder="Enter author/staff name"
                    value={newAskedBy}
                    onChange={(e) => setNewAskedBy(e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Initial Answer (Optional)</FormLabel>
                  <FormTextArea
                    rows="3"
                    placeholder="If you already have an answer, type it here (or leave blank to answer later)..."
                    value={newInitialAnswer}
                    onChange={(e) => setNewInitialAnswer(e.target.value)}
                  />
                </FormGroup>
              </ModalBody>

              <ModalFooter>
                <CancelModalBtn type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </CancelModalBtn>
                <SubmitModalBtn type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Post Question"}
                </SubmitModalBtn>
              </ModalFooter>
            </form>
          </ModalContent>
        </ModalBackdrop>
      )}
    </Container>
  );
};

export default QnaPage;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  background-color: #f4f6f8;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconWrapper = styled.div`
  background: linear-gradient(135deg, #557153 0%, #3d523b 100%);
  color: white;
  padding: 0.75rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(85, 113, 83, 0.25);
`;

const TitleContent = styled.div``;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
`;

const AskButton = styled.button`
  background: linear-gradient(135deg, #557153 0%, #3d523b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(85, 113, 83, 0.25);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(85, 113, 83, 0.35);
  }
`;

const FilterCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const FilterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.6rem 1rem;
  flex: 1;
  min-width: 280px;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #557153;
    box-shadow: 0 0 0 3px rgba(85, 113, 83, 0.15);
  }
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  margin-left: 0.5rem;
  font-size: 0.9rem;
  color: #1f2937;
`;

const ClearSearch = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover { color: #4b5563; }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TabButton = styled.button`
  background: ${props => props.active ? "#557153" : "#f3f4f6"};
  color: ${props => props.active ? "white" : "#4b5563"};
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? "#445b42" : "#e5e7eb"};
  }
`;

const QuestionsFeed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const QuestionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
`;

const CardTopHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SequenceBadge = styled.span`
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  letter-spacing: 0.5px;
`;

const CategoryBadge = styled.span`
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
  font-weight: 600;
  font-size: 0.8rem;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
`;

const StatusPill = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;

  &.answered {
    background: #f0fdf4;
    color: #15803d;
  }
  &.unanswered {
    background: #fef3c7;
    color: #b45309;
  }
`;

const Timestamp = styled.span`
  margin-left: auto;
  font-size: 0.8rem;
  color: #9ca3af;
`;

const QuestionBody = styled.div`
  margin-bottom: 1.25rem;
`;

const QuestionText = styled.h3`
  font-size: 1.15rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #6b7280;
`;

const AnswersContainer = styled.div`
  background: #fafafa;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1.5px solid #f3f4f6;
`;

const AnswersHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: #374151;
  margin-bottom: 1rem;
`;

const AnswersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
`;

const AnswerBubble = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
`;

const AnswerHeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const AnswerAuthor = styled.span`
  font-weight: 700;
  font-size: 0.85rem;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const AnswerIdBadge = styled.span`
  background: #f3f4f6;
  color: #4b5563;
  font-size: 0.75rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
`;

const AnswerTime = styled.span`
  margin-left: auto;
  font-size: 0.75rem;
  color: #9ca3af;
`;

const AnswerContent = styled.p`
  font-size: 0.9rem;
  color: #374151;
  margin: 0;
  line-height: 1.5;
`;

const NoAnswersText = styled.p`
  font-size: 0.85rem;
  color: #9ca3af;
  font-style: italic;
  margin: 0 0 1rem 0;
`;

const AddAnswerBox = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 1.5px solid #e5e7eb;
`;

const AddAnswerHeader = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #4b5563;
  margin-bottom: 0.5rem;
`;

const AnswerInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AnswerTextArea = styled.textarea`
  width: 100%;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  font-size: 0.9rem;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: #557153;
  }
`;

const AnswerFormFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const AuthorInput = styled.input`
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
  font-size: 0.85rem;
  outline: none;
  width: 200px;
`;

const SubmitAnswerBtn = styled.button`
  background: #557153;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #445b42;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 0;
  color: #6b7280;
`;

const Spinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #557153;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  background: white;
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PaginationButton = styled.button`
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 0.9rem;
  color: #4b5563;
`;

const PageNumber = styled.span`
  font-weight: 700;
  color: #557153;
`;

// Modal Styled Components
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseModalButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  &:hover { color: #111827; }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const FormLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
`;

const FormInput = styled.input`
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: #557153;
  }
`;

const FormSelect = styled.select`
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: #557153;
  }
`;

const FormTextArea = styled.textarea`
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  font-size: 0.9rem;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: #557153;
  }
`;

const PatientDropdownList = styled.div`
  position: absolute;
  top: 100%; left: 0; right: 0;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  max-height: 180px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const PatientDropdownItem = styled.div`
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;

  &:hover {
    background: #f0fdf4;
    color: #166534;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const CancelModalBtn = styled.button`
  background: white;
  border: 1.5px solid #d1d5db;
  color: #374151;
  border-radius: 10px;
  padding: 0.65rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
`;

const SubmitModalBtn = styled.button`
  background: linear-gradient(135deg, #557153 0%, #3d523b 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.65rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
