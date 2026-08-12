import {
  Banknote,
  Bell,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  ListTree,
  Map,
  MessageSquare,
  ReceiptText,
  Settings,
  TicketCheck,
  User,
  UserCog,
  Users,
} from "lucide-react";

// This is the single source of truth for portal navigation. Every page shell
// consumes these functions so entering a feature area cannot change the menu.
export const entrepreneurNavigation = () => [
  ["/portal", LayoutDashboard, "Overview"],
  ["/portal/events", Map, "Book a booth"],
  ["/portal/bookings", TicketCheck, "My bookings"],
  ["/portal/sales", Banknote, "Sales"],
  ["/portal/notifications", Bell, "Notifications"],
  ["/portal/feedback", MessageSquare, "My Feedback"],
  ["/portal/profile", User, "Profile"],
  ["/portal/settings", Settings, "Settings"],
];

export const staffNavigation = (role) => [
  ["/admin", LayoutDashboard, "Overview"],
  ["/admin/events", CalendarDays, "Events"],
  ["/admin/revenue", Banknote, "Revenue"],
  ["/admin/refunds", ReceiptText, "Refunds"],
  ["/admin/entrepreneurs", Users, "Entrepreneurs"],
  ["/admin/feedback", MessageSquare, "Feedback"],
  ...(["admin", "superadmin"].includes(role)
    ? [["/admin/staff", UserCog, "Staff Management"]]
    : []),
  ...(role === "superadmin"
    ? [
        ["/admin/sessions", Clock3, "Sessions"],
        ["/admin/system-logs", ListTree, "System Logs"],
        ["/admin/settings", Settings, "Security Settings"],
      ]
    : []),
];
