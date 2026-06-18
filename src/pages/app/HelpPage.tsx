import { Link } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  HelpCircle,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MenuItemRow } from "@/components/molecules";

const HELP_CATEGORIES = [
  {
    icon: BookOpen,
    label: "Getting Started",
    description: "Setup, onboarding, and first steps",
    href: "/about",
  },
  {
    icon: FileText,
    label: "Listings & Properties",
    description: "Posting, managing, and finding rooms",
    href: "/help#listings",
  },
  {
    icon: Shield,
    label: "Safety & Verification",
    description: "Account security, reporting, and trust",
    href: "/help#safety",
  },
  {
    icon: MessageSquare,
    label: "Chat & Communication",
    description: "Messaging, notifications, and preferences",
    href: "/help#chat",
  },
];

export function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-5 page-fade">
      <div className="flex items-center gap-3">
        <Button variant="icon" size="icon" onClick={() => navigate("/profile")}>
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </Button>
        <h1 className="text-h1">Help & Support</h1>
      </div>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <HelpCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <h2 className="text-h3">How can we help?</h2>
            <p className="mt-1 text-body-md text-ink-2">
              Browse common topics below or contact our support team.
            </p>
          </div>
        </div>
      </Card>

      <Card className="divide-y divide-line p-0">
        {HELP_CATEGORIES.map((item, i) => {
          const Icon = item.icon;
          return (
            <MenuItemRow
              key={item.label}
              icon={Icon}
              label={item.label}
              description={item.description}
              onClick={() => navigate(item.href)}
              isLast={i === HELP_CATEGORIES.length - 1}
            />
          );
        })}
      </Card>

      <Card className="p-5">
        <h2 className="text-h3 mb-2">Need more help?</h2>
        <p className="text-body-md text-ink-2 mb-4">
          Our support team typically responds within 24 hours.
        </p>
        <Link to="/settings/report-problem">
          <Button variant="secondary" fullWidth>
            Contact Support
          </Button>
        </Link>
      </Card>
    </div>
  );
}
