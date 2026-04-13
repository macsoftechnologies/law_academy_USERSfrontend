import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage        from './pages/Landing/LandingPage';
import LoginPage          from './pages/Auth/LoginPage';
import RegisterPage       from './pages/Auth/RegisterPage';
import SignInOtherWay     from './pages/Auth/SignInOtherWay';
import OtpVerify          from './pages/Auth/OtpVerify';
import ForgotPassword     from './pages/Auth/ForgotPassword';
import Dashboard          from './pages/Dashboard/Dashboard/Dashboard';
import Profile            from './pages/Dashboard/Profile/Profile';
import PrivateRoute       from './components/PrivateRoute';
import ReferralScreen     from './pages/Auth/ReferralScreen';
import PrelimsQAList      from './pages/Prelims/PrelimsQAList';
import AllSubjects        from './pages/Dashboard/Dashboard/Allsubjects';
import CategoryDetail     from './pages/Dashboard/Dashboard/Categories/Categorydetail';
import SubcategoryDetail  from './pages/Dashboard/Dashboard/Categories/Subcategorydetail';
import AllGuestLectures   from './pages/Dashboard/Dashboard/Allguestlectures';
import GuestLectureDetail from './pages/Dashboard/Dashboard/Guestlecturedetail';
import SubjectDetail      from './pages/Dashboard/Dashboard/SubjectDetail';
import LawsPage           from './pages/Dashboard/Dashboard/Categories/Lawpage';
import SubjectsPage       from './pages/Dashboard/Dashboard/Categories/Subjectpage';
import LecturesPage       from './pages/Dashboard/Dashboard/Categories/Lecturespage';
import AllCategories      from './pages/Dashboard/Dashboard/Categories/Allcategories';
import LectureDetails     from './pages/Dashboard/Dashboard/Categories/LectureDetails';
import AllNotes           from './pages/Notes/AllNotes';
import NoteDetailPage     from './pages/Notes/Notedetailpage';
import AllPrelims         from './pages/Prelims/Allprelims';
import PrelimsDetail      from './pages/Prelims/Prelimsdetail';
import PrelimsCategories  from './pages/Prelims/PrelimsCategories';
import AllMains           from './pages/Mains/AllMains';
import MainsDetail        from './pages/Mains/Mainsdetail';
import MainsTestDetail    from './pages/Mains/Mainstestdetail';
import MainsResult        from './pages/Mains/Mainsresult';
import MainsCategories from './pages/Mains/MainsCategories';
import MainsQAList from './pages/Mains/MainsQAList';
import MainsTestAttempt from './pages/Mains/MainsTestAttempt';
import MainsTestSeriesList from './pages/Mains/MainsTestSeriesList';
import ExamList   from './pages/Exam/ExamList';
import MockTest   from './pages/Exam/MockTest';
import ExamResult from './pages/Exam/ExamResult';
import MyCourses   from './pages/Dashboard/MyCourses/MyCourses';
import MyDownloads from './pages/Dashboard/Downloads/MyDownloads';
import Billing     from './pages/Dashboard/Billing/Billing';
import Wishlist    from './pages/Dashboard/Wishlist/Wishlist';
import Cart        from './pages/Dashboard/Cart/Cart';
import FAQs        from './pages/Dashboard/FAQs/FAQs';
import HelpCenter  from './pages/Dashboard/Help/HelpCenter';
import Referrals   from './pages/Dashboard/Referrals/Referrals';
import Terms       from './pages/Dashboard/Terms/Terms';
import Privacy     from './pages/Dashboard/Privacy/Privacy';
import SubcategoryCheckout from './pages/Dashboard/Dashboard/Categories/SubcategoryCheckout';
import SubjectLawTabs from './pages/Dashboard/Dashboard/Subjects/SubjectLawTabs';
import EnrollmentDetails from './pages/Dashboard/MyCourses/EnrollmentDetails';
import ExamTerms from './pages/Exam/ExamTerms';
import ExamInstructions from './pages/Exam/ExamInstructions';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<LandingPage />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/register"       element={<RegisterPage />} />
      <Route path="/signinotherway" element={<SignInOtherWay />} />
      <Route path="/otpverify"      element={<OtpVerify />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/referral"       element={<ReferralScreen />} />

      {/* Protected */}
      <Route path="/dashboard"                    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/dashboard/profile"            element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/categories"                   element={<PrivateRoute><AllCategories /></PrivateRoute>} />
      <Route path="/subjects"                     element={<PrivateRoute><AllSubjects /></PrivateRoute>} />
      <Route path="/category/:categoryId"         element={<PrivateRoute><CategoryDetail /></PrivateRoute>} />
      <Route path="/subcategory/:subcategoryId"   element={<PrivateRoute><SubcategoryDetail /></PrivateRoute>} />
      <Route path="/subject/:subjectId"           element={<PrivateRoute><SubjectDetail /></PrivateRoute>} />

      {/* Laws → Subjects → Lectures drill-down */}
      <Route path="/laws/:subcategoryId"          element={<PrivateRoute><LawsPage /></PrivateRoute>} />
      <Route path="/subjects/:lawId"              element={<PrivateRoute><SubjectsPage /></PrivateRoute>} />
      <Route path="/lectures/:subjectId"          element={<PrivateRoute><LecturesPage /></PrivateRoute>} />
<Route path="/subcategory/:subcategoryId/checkout" element={<PrivateRoute><SubcategoryCheckout /></PrivateRoute>} />
      <Route
  path="/subject-laws/:subjectId"
  element={
    <PrivateRoute>
      <SubjectLawTabs />
    </PrivateRoute>
  }
/>
      
      {/* Guest Lectures */}
      <Route path="/guest-lectures"               element={<PrivateRoute><AllGuestLectures /></PrivateRoute>} />
      <Route path="/guest-lecture/:lectureId"     element={<PrivateRoute><GuestLectureDetail /></PrivateRoute>} />

      {/* Lecture */}
      <Route path="/lecture/:lectureId"           element={<PrivateRoute><LectureDetails /></PrivateRoute>} />

     {/* Prelims */}
      <Route path="/prelims"                           element={<PrivateRoute><AllPrelims /></PrivateRoute>} />
      <Route path="/prelims/:prelimsId"                element={<PrivateRoute><PrelimsDetail /></PrivateRoute>} />
      <Route path="/prelims/:prelimsId/categories"     element={<PrivateRoute><PrelimsCategories /></PrivateRoute>} />
      <Route path="/prelims/:prelimsId/qa/:module_type" element={<PrivateRoute><PrelimsQAList /></PrivateRoute>} />  {/* ← NEW */}
<Route path="/prelims/:prelimsId/tests"            element={<PrivateRoute><PrelimsQAList /></PrivateRoute>} />

      {/* Mains */}
      <Route path="/mains"                                        element={<PrivateRoute><AllMains /></PrivateRoute>} />
      <Route path="/mains/:mainsId"                               element={<PrivateRoute><MainsDetail /></PrivateRoute>} />
      <Route path="/mains/:mainsId/categories"                    element={<PrivateRoute><MainsCategories /></PrivateRoute>} />
      <Route path="/mains/:mainsId/test/:testId"                  element={<PrivateRoute><MainsTestDetail /></PrivateRoute>} />
      <Route path="/mains/:mainsId/test/:testId/result/:resultId" element={<PrivateRoute><MainsResult /></PrivateRoute>} />
<Route
  path="/mains/:mainsId/qa/:module_type"
  element={<PrivateRoute><MainsQAList /></PrivateRoute>}
/>

<Route
  path="/mains/:mainsId/test-series"
  element={<PrivateRoute><MainsTestSeriesList /></PrivateRoute>}
/>
<Route
  path="/mains/:mainsId/test/:testId/attempt/:subjectTestId"
  element={<PrivateRoute><MainsTestAttempt /></PrivateRoute>}
/>


      {/* Notes */}
      <Route path="/notes"                        element={<PrivateRoute><AllNotes /></PrivateRoute>} />
      <Route path="/notes/:notesId"               element={<PrivateRoute><NoteDetailPage /></PrivateRoute>} />

      {/* Exam */}
      <Route path="/exam"                         element={<PrivateRoute><ExamList /></PrivateRoute>} />
      <Route path="/exam/mock-test"               element={<PrivateRoute><MockTest /></PrivateRoute>} />
      <Route path="/exam/mock-test/:examId"       element={<PrivateRoute><MockTest /></PrivateRoute>} />
      <Route path="/exam/result"                  element={<PrivateRoute><ExamResult /></PrivateRoute>} />
<Route path="/prelims/:prelimsId/exam-terms"        element={<PrivateRoute><ExamTerms /></PrivateRoute>} />
<Route path="/prelims/:prelimsId/exam-instructions" element={<PrivateRoute><ExamInstructions /></PrivateRoute>} />
<Route path="/prelims/:prelimsId/exam/:testId"      element={<PrivateRoute><MockTest /></PrivateRoute>} />
<Route path="/prelims/:prelimsId/exam-result"       element={<PrivateRoute><ExamResult /></PrivateRoute>} />
      {/* Dashboard Menu Pages */}
      <Route path="/dashboard/my-courses" element={<PrivateRoute><MyCourses /></PrivateRoute>} />
<Route path="/enrollment/:enrollId" element={<PrivateRoute><EnrollmentDetails /></PrivateRoute>} />


      <Route path="/dashboard/downloads"  element={<PrivateRoute><MyDownloads /></PrivateRoute>} />
      <Route path="/dashboard/payments"   element={<PrivateRoute><Billing /></PrivateRoute>} />
      <Route path="/dashboard/wishlist"   element={<PrivateRoute><Wishlist /></PrivateRoute>} />
      <Route path="/dashboard/cart"       element={<PrivateRoute><Cart /></PrivateRoute>} />
      <Route path="/dashboard/faqs"       element={<PrivateRoute><FAQs /></PrivateRoute>} />
      <Route path="/dashboard/help"       element={<PrivateRoute><HelpCenter /></PrivateRoute>} />
      <Route path="/dashboard/referrals"  element={<PrivateRoute><Referrals /></PrivateRoute>} />
      <Route path="/dashboard/terms"      element={<PrivateRoute><Terms /></PrivateRoute>} />
      <Route path="/dashboard/privacy"    element={<PrivateRoute><Privacy /></PrivateRoute>} />

<Route path="/prelims/:prelimsId/exam-terms"        element={<PrivateRoute><ExamTerms /></PrivateRoute>} />
<Route path="/prelims/:prelimsId/exam-instructions" element={<PrivateRoute><ExamInstructions /></PrivateRoute>} />
<Route path="/prelims/:prelimsId/exam/:testId"      element={<PrivateRoute><MockTest /></PrivateRoute>} />
<Route path="/prelims/:prelimsId/exam-result"       element={<PrivateRoute><ExamResult /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}