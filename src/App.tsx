import { Routes, Route } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { Providers } from "./providers";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthGuard, AdminGuard } from "./pages/guards";
import { PublicLayout } from "./pages/public/PublicLayout";
import { AuthLayout } from "./pages/auth/AuthLayout";
import { AppLayout } from "./pages/app/AppLayout";
import { AdminLayout } from "./pages/admin/AdminLayout";

// Public pages
import { LandingPage } from "./pages/public/LandingPage";
import { AboutPage } from "./pages/public/AboutPage";
import { TermsPage } from "./pages/public/TermsPage";
import { PrivacyPage } from "./pages/public/PrivacyPage";
import { StatsPage } from "./pages/public/StatsPage";
import { MaintenancePage } from "./pages/public/MaintenancePage";
import { ErrorPage } from "./pages/public/ErrorPage";
import { DiscoverPage } from "./pages/public/DiscoverPage";
import { ListingDetailPage } from "./pages/public/ListingDetailPage";
import { SearchPage } from "./pages/public/SearchPage";
import { SemanticSearchPage } from "./pages/public/SemanticSearchPage";
import { SharePage } from "./pages/public/SharePage";

// Auth pages
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";

// App pages
import { HomePage } from "./pages/app/HomePage";
import { SwipePage } from "./pages/app/SwipePage";
import { LikesPage } from "./pages/app/LikesPage";
import { MatchesPage } from "./pages/app/MatchesPage";
import { ChatsPage } from "./pages/app/ChatsPage";
import { ChatDetailPage } from "./pages/app/ChatDetailPage";
import { ExplorePage } from "./pages/app/ExplorePage";
import { NotificationsPage } from "./pages/app/NotificationsPage";
import { ProfilePage } from "./pages/app/ProfilePage";
import { PublicProfilePage } from "./pages/app/PublicProfilePage";
import { ProfileEditPage } from "./pages/app/ProfileEditPage";
import { SettingsPage } from "./pages/app/SettingsPage";
import { AppearancePage } from "./pages/app/AppearancePage";
import { SettingsNotificationsPage } from "./pages/app/SettingsNotificationsPage";
import { BlockedUsersPage } from "./pages/app/BlockedUsersPage";
import { ReportProblemPage } from "./pages/app/ReportProblemPage";
import { PostPage } from "./pages/app/PostPage";
import { PostReviewPage } from "./pages/app/PostReviewPage";
import { ManagePage } from "./pages/app/ManagePage";
import { DashboardPage } from "./pages/app/DashboardPage";
import { AnalyticsPage } from "./pages/app/AnalyticsPage";
import { VisitsPage } from "./pages/app/VisitsPage";
import { VisitDetailPage } from "./pages/app/VisitDetailPage";
import { CompatibilityPage } from "./pages/app/CompatibilityPage";
import { MyListingDetailPage } from "./pages/app/MyListingDetailPage";
import { MyListingEditPage } from "./pages/app/MyListingEditPage";
import { ChooseRolePage } from "./pages/app/ChooseRolePage";
import { LocationPage } from "./pages/app/LocationPage";
import { OnboardingPage } from "./pages/app/OnboardingPage";
import { OnboardingStepPage } from "./pages/app/OnboardingStepPage";
import { VerifyPage } from "./pages/app/VerifyPage";
import { HelpPage } from "./pages/app/HelpPage";
import { AlertsPage } from "./pages/app/AlertsPage";
import { SavedSearchesPage } from "./pages/app/SavedSearchesPage";
import { AuthCallbackPage } from "./pages/auth/AuthCallbackPage";

// Admin pages
import { AdminStatsPage } from "./pages/admin/AdminStatsPage";
import { ModerationListingsPage } from "./pages/admin/ModerationListingsPage";
import { ModerationReportsPage } from "./pages/admin/ModerationReportsPage";
import { PrescreenPage } from "./pages/admin/PrescreenPage";

// Shared pages
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  return (
    <HelmetProvider>
      <Providers>
        <ErrorBoundary>
          <Routes>
          {/* ── Public routes ── */}
          <Route element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="discover/:id" element={<ListingDetailPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="share/:id" element={<SharePage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="error" element={<ErrorPage />} />
          </Route>

          {/* ── Auth routes ── */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="auth/callback" element={<AuthCallbackPage />} />
          </Route>

          {/* ── Authenticated app routes ── */}
          <Route element={<AuthGuard />}>
            <Route element={<AppLayout />}>
              <Route path="home" element={<HomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="search/semantic" element={<SemanticSearchPage />} />
              <Route path="swipe" element={<SwipePage />} />
              <Route path="likes" element={<LikesPage />} />
              <Route path="matches" element={<MatchesPage />} />
              <Route path="chats" element={<ChatsPage />} />
              <Route path="chats/:id" element={<ChatDetailPage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="listing/:id" element={<ListingDetailPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/edit" element={<ProfileEditPage />} />
              <Route path="profile/:id" element={<PublicProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/appearance" element={<AppearancePage />} />
              <Route path="settings/notifications" element={<SettingsNotificationsPage />} />
              <Route path="settings/blocked-users" element={<BlockedUsersPage />} />
              <Route path="settings/report-problem" element={<ReportProblemPage />} />
              <Route path="post" element={<PostPage />} />
              <Route path="post/review" element={<PostReviewPage />} />
              <Route path="manage" element={<ManagePage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="dashboard/analytics" element={<AnalyticsPage />} />
              <Route path="visits" element={<VisitsPage />} />
              <Route path="visits/:id" element={<VisitDetailPage />} />
              <Route path="compatibility/:id" element={<CompatibilityPage />} />
              <Route path="my-listings/:id" element={<MyListingDetailPage />} />
              <Route path="my-listings/:id/edit" element={<MyListingEditPage />} />
              <Route path="choose-role" element={<ChooseRolePage />} />
              <Route path="location" element={<LocationPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="onboarding/:step" element={<OnboardingStepPage />} />
              <Route path="verify" element={<VerifyPage />} />
              <Route path="help" element={<HelpPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="saved-searches" element={<SavedSearchesPage />} />
            </Route>
          </Route>

          {/* ── Admin routes ── */}
          <Route element={<AdminGuard />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route path="stats" element={<AdminStatsPage />} />
              <Route path="moderation/listings" element={<ModerationListingsPage />} />
              <Route path="moderation/reports" element={<ModerationReportsPage />} />
              <Route path="moderation/prescreen/:id" element={<PrescreenPage />} />
            </Route>
          </Route>

          {/* ── Catch-all ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </ErrorBoundary>
      </Providers>
    </HelmetProvider>
  );
}
