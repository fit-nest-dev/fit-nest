import './App.css'
import Signup from './pages/signup/Signup'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Shop from './pages/shop/shop';
import { useAuthContext } from './context/AuthContext'
import PaymentPage from './components/PaymentPage'
import SuccessPage from './components/SuccessPage'
import NavigationBar from './components/Navbar';
import AdminPortal from './components/AdminComponents/AdminPortal'
import PaymentForPersonalTrainer from './components/PaymentComponents/PaymentForPersonalTrainer'
import SuccessPagePaymentTrainer from './components/PaymentComponents/SuccessPagePaymentTrainer'
import TariffPage from './pages/TariffPage'
import PaymentForMembership from './components/PaymentComponents/PaymentForMembership'
import SuccessPageMembershipBuy from './components/PaymentComponents/SuccessPageMembershipBuy'
import Footer from './components/Footer'
import Home1 from './components/Home1'
import CartPage from './components/CartPage'
import AboutUs from './components/Aboutus'
import FailureResponse from './components/PaymentComponents/FailureResponse'
import DescriptionBox from './components/DescriptionBox'
import Login2 from './pages/login/Login2'
import ForgotPassword from './pages/ForgotPassword'
import ChangePassword from './components/ChangePassword'
import MemberDashboard from './pages/membershipDashboard/MemberDashboard'
import NewMembershipBuy from './components/NewMembershipBuy'
import ContactUs from './components/ContactUs';
import SuccessForNewMembershipBuy from './components/PaymentComponents/SuccesForNewMembershipBuy';
import ReturnPolicy from './components/ReturnPolicy';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import CodeOfConduct from './components/CodeOfConduct';
import NewMembershipBuy2 from './components/NewMembershipBuy2';
//hello
/**
 * The main app component. It renders the routes and the toaster.
 * @returns The app component
 */
function App() {
  const { Authuser } = useAuthContext();
  return (
    <div className="h-screen flex flex-col">
      <div className="w-full">
        {!Authuser?.isAdmin && <NavigationBar />}
      </div>
      <div className="w-full flex-grow">
        <Routes>
          <Route path="/" element={Authuser?.isAdmin ? <AdminPortal /> : <Home1 />} />
          <Route path='/home' element={!Authuser?.isAdmin ? <Home1 /> : <Navigate to='/' />} />
          <Route path='/aboutus' element={!Authuser?.isAdmin ? <AboutUs /> : <Navigate to='/' />} />
          <Route path="/shop" element={!Authuser?.isAdmin ? <Shop /> : <Navigate to='/' />} />
          <Route path="/members" element={!Authuser?.isAdmin ? <TariffPage /> : Authuser?.isAdmin ? <Navigate to='/' /> : <Navigate to="/login" />} />
          <Route path="/login" element={Authuser?.isAdmin ? <Navigate to='/' /> : Authuser ? <Navigate to="/home" /> : <Login2 />} />
          <Route path="/signup" element={Authuser ? <Navigate to="/home" /> : <Signup />} />
          <Route path="/payment/:ProductId/:AuthUserId" element={!Authuser?.isAdmin ? <PaymentPage /> : <Navigate to='/' />} />
          <Route path="/success/:orderId/:AuthUserId" element={!Authuser?.isAdmin ? <SuccessPage /> : <Navigate to='/' />} />
          <Route path='/AdminPortal' element={Authuser?.isAdmin ? <AdminPortal /> : <Navigate to={'/login'} />} />
          <Route path='/PayPersonalTrainer/:TrainerId/:userId/:startDate/:endDate/:amount' element={!Authuser?.isAdmin ? <PaymentForPersonalTrainer /> : <Navigate to='/' />} />
          <Route path='/Success/:orderId/:userId/:TrainerId/:amount' element={!Authuser?.isAdmin ? <SuccessPagePaymentTrainer /> : <Navigate to='/' />} />
          <Route path='/tariff' element={<TariffPage />} />
          <Route path='/checkout' element={!Authuser?.isAdmin ? <CartPage /> : <Navigate to='/' />} />
          <Route path='/Check-Status/:PaymentId/:amount' element={<FailureResponse />} />
          <Route path='/description' element={<DescriptionBox />} />
          <Route path='/PayForMembership/:type/:price/:userId' element={<PaymentForMembership />} />
          <Route path='/SuccessMembership/:orderId/:userId/:type/:price' element={<SuccessPageMembershipBuy />} />
          <Route path='/SuccessNewMembership/:orderId/:userId/:type/:price' element={<SuccessForNewMembershipBuy />} />
          <Route path='/payment' element={<PaymentPage />} />
          <Route path='/Forgot-password/:emailToChange' element={<ForgotPassword />} />
          <Route path="/changepassword" element={<ChangePassword />} />
          <Route path='/profile-page' element={<MemberDashboard />} />
          <Route path='/new-membership-buy/:type/:price' element={<NewMembershipBuy />} />
          <Route path='/BUY-MEMBERSHIP/:type/:price' element={<NewMembershipBuy2 />} />
          <Route path='/Register-After-Pay-Success/:orderId/:type/:price' element={<Signup />} />
          <Route path='/footer' element={<ContactUs />} />
          <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
          <Route path='/code-of-conduct' element={<CodeOfConduct />} />
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          <Route path='/return-policy' element={<ReturnPolicy />} />
        </Routes>
      </div>
      <Toaster />
      {!Authuser?.isAdmin && <Footer path='/footer' />}
    </div>
  )
}
export default App
