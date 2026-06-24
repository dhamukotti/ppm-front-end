"use client"
import React, { useState, createContext, useContext, useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Tooltip,
  Badge,
  Stack,
  Divider,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
  useTheme,
  Autocomplete,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

// ─── Theme Context ────────────────────────────────────────────────────────────

const ColorModeContext = createContext({ toggleColorMode: () => {} });

// ─── Types ───────────────────────────────────────────────────────────────────

type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked";
type TaskPriority = "low" | "medium" | "high" | "critical";

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  project: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: "online" | "offline" | "away";
  tasks: Task[];
}

// ─── Mock Data with more users ────────────────────────────────────────────────

const USERS: User[] = [
  {
    id: "u1",
    name: "Arjun Ramesh",
    email: "arjun.ramesh@company.io",
    role: "Frontend Engineer",
    avatar: "AR",
    status: "online",
    tasks: [
      { id: "t1", title: "Redesign login page UI", status: "in_progress", priority: "high", dueDate: "2026-06-12", project: "Auth Module" },
      { id: "t2", title: "Fix table pagination bug", status: "done", priority: "medium", dueDate: "2026-06-08", project: "Bug Queue" },
      { id: "t3", title: "Write unit tests for FilterBar", status: "todo", priority: "low", dueDate: "2026-06-20", project: "Bug Queue" },
      { id: "t4", title: "Implement dark mode toggle", status: "review", priority: "medium", dueDate: "2026-06-15", project: "Settings" },
    ],
  },
  {
    id: "u2",
    name: "Priya Nair",
    email: "priya.nair@company.io",
    role: "Backend Engineer",
    avatar: "PN",
    status: "away",
    tasks: [
      { id: "t5", title: "Build /api/users endpoint", status: "done", priority: "high", dueDate: "2026-06-05", project: "User Service" },
      { id: "t6", title: "Database migration for roles", status: "in_progress", priority: "critical", dueDate: "2026-06-11", project: "User Service" },
      { id: "t7", title: "Rate limiting middleware", status: "blocked", priority: "high", dueDate: "2026-06-10", project: "API Gateway" },
    ],
  },
  {
    id: "u3",
    name: "Karthik Selvam",
    email: "karthik.s@company.io",
    role: "QA Engineer",
    avatar: "KS",
    status: "online",
    tasks: [
      { id: "t8", title: "Write E2E tests for checkout", status: "in_progress", priority: "high", dueDate: "2026-06-13", project: "E-Commerce" },
      { id: "t9", title: "Regression test sprint 12", status: "todo", priority: "medium", dueDate: "2026-06-18", project: "QA Sprint" },
      { id: "t10", title: "Performance benchmark API", status: "review", priority: "low", dueDate: "2026-06-22", project: "API Gateway" },
      { id: "t11", title: "Document test cases v3", status: "todo", priority: "low", dueDate: "2026-06-25", project: "QA Sprint" },
      { id: "t12", title: "Fix flaky login test", status: "done", priority: "critical", dueDate: "2026-06-07", project: "Auth Module" },
    ],
  },
  {
    id: "u4",
    name: "Divya Krishnan",
    email: "divya.k@company.io",
    role: "UI/UX Designer",
    avatar: "DK",
    status: "offline",
    tasks: [
      { id: "t13", title: "Dashboard wireframes v2", status: "done", priority: "high", dueDate: "2026-06-06", project: "Design System" },
      { id: "t14", title: "Component library audit", status: "in_progress", priority: "medium", dueDate: "2026-06-16", project: "Design System" },
    ],
  },
  {
    id: "u5",
    name: "Suresh Kumar",
    email: "suresh.k@company.io",
    role: "DevOps Engineer",
    avatar: "SK",
    status: "online",
    tasks: [
      { id: "t15", title: "Setup Kubernetes cluster", status: "in_progress", priority: "critical", dueDate: "2026-06-14", project: "Infrastructure" },
      { id: "t16", title: "CI/CD pipeline optimization", status: "todo", priority: "high", dueDate: "2026-06-19", project: "DevOps" },
      { id: "t17", title: "Monitor logging setup", status: "done", priority: "medium", dueDate: "2026-06-09", project: "Infrastructure" },
    ],
  },
  {
    id: "u6",
    name: "Meera Iyer",
    email: "meera.iyer@company.io",
    role: "Product Manager",
    avatar: "MI",
    status: "away",
    tasks: [
      { id: "t18", title: "Sprint planning Q3", status: "done", priority: "high", dueDate: "2026-06-04", project: "Product" },
      { id: "t19", title: "User feedback analysis", status: "in_progress", priority: "medium", dueDate: "2026-06-17", project: "Product" },
      { id: "t20", title: "Roadmap presentation", status: "todo", priority: "high", dueDate: "2026-06-21", project: "Product" },
      { id: "t21", title: "Stakeholder meeting notes", status: "done", priority: "low", dueDate: "2026-06-03", project: "Product" },
    ],
  },
  {
    id: "u7",
    name: "Rahul Sharma",
    email: "rahul.sharma@company.io",
    role: "Mobile Developer",
    avatar: "RS",
    status: "offline",
    tasks: [
      { id: "t22", title: "React Native upgrade", status: "blocked", priority: "high", dueDate: "2026-06-10", project: "Mobile App" },
      { id: "t23", title: "Push notifications implementation", status: "in_progress", priority: "critical", dueDate: "2026-06-13", project: "Mobile App" },
      { id: "t24", title: "Offline sync feature", status: "todo", priority: "medium", dueDate: "2026-06-25", project: "Mobile App" },
    ],
  },
  {
    id: "u8",
    name: "Neha Gupta",
    email: "neha.gupta@company.io",
    role: "Data Scientist",
    avatar: "NG",
    status: "online",
    tasks: [
      { id: "t25", title: "ML model training", status: "in_progress", priority: "high", dueDate: "2026-06-15", project: "Analytics" },
      { id: "t26", title: "Data pipeline setup", status: "done", priority: "medium", dueDate: "2026-06-07", project: "Analytics" },
      { id: "t27", title: "Dashboard metrics implementation", status: "review", priority: "low", dueDate: "2026-06-20", project: "Analytics" },
      { id: "t28", title: "A/B testing framework", status: "todo", priority: "high", dueDate: "2026-06-22", project: "Analytics" },
      { id: "t29", title: "Data quality report", status: "done", priority: "medium", dueDate: "2026-06-06", project: "Analytics" },
    ],
  },
  {
    id: "u9",
    name: "Vikram Singh",
    email: "vikram.s@company.io",
    role: "Security Engineer",
    avatar: "VS",
    status: "away",
    tasks: [
      { id: "t30", title: "Security audit Q2", status: "in_progress", priority: "critical", dueDate: "2026-06-18", project: "Security" },
      { id: "t31", title: "Penetration testing", status: "todo", priority: "high", dueDate: "2026-06-24", project: "Security" },
      { id: "t32", title: "GDPR compliance check", status: "done", priority: "high", dueDate: "2026-06-05", project: "Security" },
    ],
  },
  {
    id: "u10",
    name: "Anjali Menon",
    email: "anjali.m@company.io",
    role: "Technical Writer",
    avatar: "AM",
    status: "online",
    tasks: [
      { id: "t33", title: "API documentation update", status: "in_progress", priority: "medium", dueDate: "2026-06-16", project: "Documentation" },
      { id: "t34", title: "User guide for dashboard", status: "todo", priority: "low", dueDate: "2026-06-23", project: "Documentation" },
      { id: "t35", title: "Release notes v2.0", status: "done", priority: "high", dueDate: "2026-06-08", project: "Documentation" },
      { id: "t36", title: "Tutorial videos script", status: "review", priority: "medium", dueDate: "2026-06-19", project: "Documentation" },
    ],
  },
  {
    id: "u11",
    name: "Manoj Tiwari",
    email: "manoj.t@company.io",
    role: "Backend Engineer",
    avatar: "MT",
    status: "offline",
    tasks: [
      { id: "t37", title: "Microservices architecture", status: "in_progress", priority: "critical", dueDate: "2026-06-14", project: "Backend" },
      { id: "t38", title: "Database indexing optimization", status: "todo", priority: "high", dueDate: "2026-06-21", project: "Backend" },
      { id: "t39", title: "API versioning strategy", status: "done", priority: "medium", dueDate: "2026-06-07", project: "Backend" },
    ],
  },
  {
    id: "u12",
    name: "Swati Joshi",
    email: "swati.j@company.io",
    role: "Frontend Engineer",
    avatar: "SJ",
    status: "online",
    tasks: [
      { id: "t40", title: "Component library migration", status: "in_progress", priority: "high", dueDate: "2026-06-17", project: "Frontend" },
      { id: "t41", title: "Performance optimization", status: "review", priority: "medium", dueDate: "2026-06-13", project: "Frontend" },
      { id: "t42", title: "Accessibility improvements", status: "todo", priority: "high", dueDate: "2026-06-24", project: "Frontend" },
      { id: "t43", title: "Responsive design fixes", status: "done", priority: "low", dueDate: "2026-06-06", project: "Frontend" },
      { id: "t44", title: "State management setup", status: "in_progress", priority: "critical", dueDate: "2026-06-15", project: "Frontend" },
    ],
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; darkBg: string; icon: string }> = {
  todo:        { label: "To Do",       color: "#94a3b8", bg: "#f1f5f9",  darkBg: "#1e293b", icon: "mdi:circle-outline" },
  in_progress: { label: "In Progress", color: "#60a5fa", bg: "#dbeafe",  darkBg: "#1e3a5f", icon: "mdi:progress-clock" },
  review:      { label: "In Review",   color: "#fbbf24", bg: "#fef3c7",  darkBg: "#3d2e00", icon: "mdi:eye-outline" },
  done:        { label: "Done",        color: "#4ade80", bg: "#dcfce7",  darkBg: "#14291e", icon: "mdi:check-circle-outline" },
  blocked:     { label: "Blocked",     color: "#f87171", bg: "#fee2e2",  darkBg: "#2d1515", icon: "mdi:block-helper" },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; darkColor: string; icon: string }> = {
  low:      { label: "Low",      color: "#64748b", darkColor: "#94a3b8", icon: "mdi:arrow-down" },
  medium:   { label: "Medium",   color: "#d97706", darkColor: "#fbbf24", icon: "mdi:minus" },
  high:     { label: "High",     color: "#ea580c", darkColor: "#fb923c", icon: "mdi:arrow-up" },
  critical: { label: "Critical", color: "#dc2626", darkColor: "#f87171", icon: "mdi:alert-circle" },
};

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "review", "done", "blocked"];

const ONLINE_COLOR: Record<User["status"], string> = {
  online:  "#16a34a",
  away:    "#d97706",
  offline: "#94a3b8",
};

// ─── Helper functions ─────────────────────────────────────────────────────────

function getCompletionRate(tasks: Task[]): number {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100);
}

function getAvatarColor(name: string): string {
  const palette = ["#6366f1","#0ea5e9","#f59e0b","#10b981","#f43f5e","#8b5cf6","#14b8a6","#ec4899"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent }: { icon: string; label: string; value: number | string; accent: string }) {
  return (
    <Box
      sx={{
        flex: "1 1 140px",
        minWidth: { xs: "calc(50% - 8px)", sm: 140 },
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        p: { xs: "14px 16px", md: "18px 20px" },
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 42, height: 42, borderRadius: "10px",
          bgcolor: `${accent}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon icon={icon} style={{ fontSize: 22, color: accent }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700, color: "text.primary", lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.3 }}>{label}</Typography>
      </Box>
    </Box>
  );
}

function TaskRow({ task }: { task: Task }) {
  const s = STATUS_CONFIG[task.status];
  const p = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.status !== "done" && new Date(task.dueDate) < new Date();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  const handleTaskClick = () => {
    router.push("/super-admin");
  };

  return (
    <TableRow
      sx={{
        "&:hover td": { bgcolor: "action.hover" },
        "& td": { border: "none", py: "10px", px: { xs: "8px", md: "14px" } },
        cursor: "pointer",
      }}
      onClick={handleTaskClick}
    >
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon icon={s.icon} style={{ color: s.color, fontSize: 16, flexShrink: 0 }} />
          <Typography sx={{ fontSize: { xs: 12, md: 13.5 }, color: "text.primary", fontWeight: 500 }}>
            {task.title}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={s.label}
          size="small"
          sx={{
            bgcolor: s.bg,
            color: s.color,
            ".dark &": { bgcolor: s.darkBg },
            fontWeight: 600, fontSize: { xs: 10, md: 11.5 },
            height: 22, borderRadius: "6px",
          }}
        />
      </TableCell>
      {!isMobile && (
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Icon icon={p.icon} style={{ color: p.color, fontSize: 14 }} />
            <Typography sx={{ fontSize: 12.5, color: p.color, fontWeight: 600 }}>
              {p.label}
            </Typography>
          </Box>
        </TableCell>
      )}
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Icon
            icon={isOverdue ? "mdi:calendar-alert" : "mdi:calendar-outline"}
            style={{ fontSize: 14, color: isOverdue ? "#f87171" : "#94a3b8" }}
          />
          <Typography
            sx={{ fontSize: { xs: 11, md: 12.5 }, color: isOverdue ? "error.main" : "text.secondary", fontWeight: isOverdue ? 600 : 400 }}
          >
            {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
          </Typography>
        </Box>
      </TableCell>
      {!isMobile && (
        <TableCell>
          <Chip
            label={task.project}
            size="small"
            variant="outlined"
            sx={{ fontSize: 11, height: 20, borderRadius: "5px", color: "text.secondary", borderColor: "divider" }}
          />
        </TableCell>
      )}
    </TableRow>
  );
}

function UserCard({ user, defaultOpen = false, searchTerm = "", selectedProject = "" }: { user: User; defaultOpen?: boolean; searchTerm?: string; selectedProject?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const completion = getCompletionRate(user.tasks);
  const avatarColor = getAvatarColor(user.name);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Filter tasks by status, project, and search term
  const filteredTasks = user.tasks.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesProject = selectedProject === "" || t.project === selectedProject;
    const matchesSearch = searchTerm === "" || t.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesProject && matchesSearch;
  });

  const taskCounts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = user.tasks.filter((t) => t.status === s).length;
    return acc;
  }, {} as Record<TaskStatus, number>);

  // Auto-open if search term matches any task or project filter is active
  const hasMatchingTask = searchTerm !== "" && user.tasks.some(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const hasMatchingProject = selectedProject !== "" && user.tasks.some(t => t.project === selectedProject);
  const shouldBeOpen = defaultOpen || (searchTerm !== "" && hasMatchingTask) || hasMatchingProject;

  React.useEffect(() => {
    if (shouldBeOpen && !open) {
      setOpen(true);
    }
  }, [shouldBeOpen, open]);

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "14px",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        bgcolor: "background.paper",
        "&:hover": { boxShadow: (t) => t.palette.mode === "dark" ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.07)" },
      }}
    >
      {/* User header */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          flexWrap: { xs: "wrap", sm: "nowrap" },
          gap: { xs: 1.5, sm: 2 },
          px: { xs: 2, md: 3 },
          py: { xs: 1.8, md: 2.2 },
          bgcolor: "background.paper",
          cursor: "pointer",
          "&:hover": { bgcolor: "action.hover" },
        }}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Avatar + name row — always full width on xs */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: "1 1 auto", minWidth: 0 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: ONLINE_COLOR[user.status], border: "2px solid", borderColor: "background.paper" }} />
            }
          >
            <Avatar sx={{ bgcolor: avatarColor, width: { xs: 38, md: 44 }, height: { xs: 38, md: 44 }, fontWeight: 700, fontSize: { xs: 13, md: 15 } }}>
              {user.avatar}
            </Avatar>
          </Badge>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: 13.5, md: 14.5 }, color: "text.primary" }}>{user.name}</Typography>
              <Chip
                label={user.role}
                size="small"
                sx={{ bgcolor: "action.selected", color: "text.secondary", fontSize: 11, height: 20, borderRadius: "5px" }}
              />
            </Box>
            <Typography sx={{ fontSize: 12, color: "text.disabled", mt: 0.2 }}>{user.email}</Typography>
          </Box>
        </Box>

        {/* Mini task pills — hidden on xs, shown sm+ */}
        {/* {!isMobile && (
          <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", justifyContent: "flex-end", flexShrink: 0 }}>
            {STATUS_ORDER.filter((s) => taskCounts[s] > 0).map((s) => (
              <Tooltip key={s} title={STATUS_CONFIG[s].label}>
                <Chip
                  label={taskCounts[s]}
                  size="small"
                  sx={{
                    bgcolor: STATUS_CONFIG[s].bg,
                    color: STATUS_CONFIG[s].color,
                    fontSize: 11, fontWeight: 700, height: 20, minWidth: 28,
                    borderRadius: "5px",
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        )} */}

        {/* Progress */}
        <Box sx={{ minWidth: { xs: "100%", sm: 90 }, flexShrink: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontSize: 11, color: "text.disabled" }}>Done</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>{completion}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completion}
            sx={{
              height: 5, borderRadius: 4,
              bgcolor: "action.disabledBackground",
              "& .MuiLinearProgress-bar": { bgcolor: completion === 100 ? "#4ade80" : "#6366f1", borderRadius: 4 },
            }}
          />
        </Box>

        <Icon
          icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
          style={{ fontSize: 20, color: "#94a3b8", flexShrink: 0, alignSelf: "center" }}
        />
      </Box>

      {/* Expandable task table */}
      <Collapse in={open}>
        <Divider sx={{ borderColor: "divider" }} />
        <Box sx={{ bgcolor: "action.hover", px: { xs: 1.5, md: 3 }, pt: 2, pb: 2.5 }}>
          {/* Filter row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "text.secondary" }}>
              {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} {searchTerm && `matching "${searchTerm}"`} {selectedProject && `in ${selectedProject}`}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
                displayEmpty
                sx={{
                  fontSize: 12.5, height: 32, borderRadius: "8px",
                  bgcolor: "background.paper",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <Icon icon="mdi:filter-variant" style={{ fontSize: 14, color: "#94a3b8" }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="all" sx={{ fontSize: 12.5 }}>All statuses</MenuItem>
                {STATUS_ORDER.map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: 12.5 }}>
                    {STATUS_CONFIG[s].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {filteredTasks.length === 0 ? (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Icon icon="mdi:tray-remove" style={{ fontSize: 32, color: "#475569" }} />
              <Typography sx={{ fontSize: 13, color: "text.disabled", mt: 1 }}>No tasks match this filter</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ borderRadius: "10px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { bgcolor: "action.hover", fontSize: 11.5, fontWeight: 700, color: "text.secondary", border: "none", py: 1.2, px: { xs: "8px", md: "14px" }, textTransform: "uppercase", letterSpacing: "0.04em" } }}>
                    <TableCell>Task</TableCell>
                    <TableCell>Status</TableCell>
                    {!isMobile && <TableCell>Priority</TableCell>}
                    <TableCell>Due</TableCell>
                    {!isMobile && <TableCell>Project</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

const AdminUserTaskPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const colorMode = useContext(ColorModeContext);

  // Get unique user names and projects for filters
  const userNames = USERS.map(user => user.name);
  const allProjects = Array.from(new Set(USERS.flatMap(user => user.tasks.map(task => task.project)))).sort();

  // Filter users by selected user name, project, and search term
  const filteredUsers = USERS.filter((u) => {
    const matchUser = selectedUserName === null || u.name === selectedUserName;
    const matchProject = selectedProject === "" || u.tasks.some(t => t.project === selectedProject);
    const matchSearch = search === "" || 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.tasks.some(t => t.title.toLowerCase().includes(search.toLowerCase()));
    return matchUser && matchProject && matchSearch;
  });

  // Global stats with project filtering
  const allTasks = USERS.flatMap((u) => u.tasks);
  const filteredTasks = selectedProject === "" 
    ? allTasks 
    : allTasks.filter(t => t.project === selectedProject);
  
  const totalDone = filteredTasks.filter((t) => t.status === "done").length;
  const totalBlocked = filteredTasks.filter((t) => t.status === "blocked").length;
  const totalInProgress = filteredTasks.filter((t) => t.status === "in_progress").length;
  const overallCompletion = filteredTasks.length > 0 ? Math.round((totalDone / filteredTasks.length) * 100) : 0;

  // Get project-specific stats for display
  const projectTasksCount = filteredTasks.length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", fontFamily: "'Inter', sans-serif" }}>

      

      {/* Page content with centralized responsive container */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          py: { xs: 3, md: 4, lg: 5 },
        }}
      >

        {/* Page title */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 20, md: 22 }, color: "text.primary", letterSpacing: "-0.4px" }}>
            Team Overview
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: "text.secondary", mt: 0.4 }}>
            Monitor all users, their tasks, priorities, and progress in one place.
          </Typography>
        </Box>

        {/* Stats row - Responsive grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(5, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <StatCard icon="mdi:account-group-outline" label="Total Members" value={USERS.length} accent="#6366f1" />
          <StatCard 
            icon="mdi:checkbox-marked-circle-outline" 
            label="Tasks Done" 
            value={`${totalDone} / ${projectTasksCount}`} 
            accent="#16a34a" 
          />
          <StatCard icon="mdi:progress-clock" label="In Progress" value={totalInProgress} accent="#2563eb" />
          <StatCard icon="mdi:block-helper" label="Blocked" value={totalBlocked} accent="#dc2626" />
          <StatCard icon="mdi:chart-line" label="Overall Completion" value={`${overallCompletion}%`} accent="#f59e0b" />
        </Box>

        {/* Filters - Responsive layout with Project Filter, User Name Filter and search */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            mb: 3,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Search by name, email, or task title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="mdi:magnify" style={{ fontSize: 18, color: "#94a3b8" }} />
                </InputAdornment>
              ),
              sx: { borderRadius: "9px", bgcolor: "background.paper", fontSize: 13.5 },
            }}
            sx={{ flex: "2 1 250px", minWidth: { xs: "100%", sm: 250 }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" } }}
          />
          
          <Autocomplete
            options={allProjects}
            value={selectedProject || null}
            onChange={(event, newValue) => setSelectedProject(newValue || "")}
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 200 }, flex: { xs: "none", sm: "0 0 auto" } }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Filter by project..."
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "9px",
                    bgcolor: "background.paper",
                  },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <Icon icon="mdi:folder-multiple" style={{ fontSize: 15, color: "#94a3b8" }} />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            clearIcon={<Icon icon="mdi:close-circle" style={{ fontSize: 16 }} />}
          />

          <Autocomplete
            options={userNames}
            value={selectedUserName}
            onChange={(event, newValue) => setSelectedUserName(newValue)}
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 200 }, flex: { xs: "none", sm: "0 0 auto" } }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Filter by user name..."
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "9px",
                    bgcolor: "background.paper",
                  },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <Icon icon="mdi:account-filter" style={{ fontSize: 15, color: "#94a3b8" }} />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            clearIcon={<Icon icon="mdi:close-circle" style={{ fontSize: 16 }} />}
          />

          {/* <Chip
            icon={<Icon icon="mdi:account-multiple" style={{ fontSize: 14 }} />}
            label={`${filteredUsers.length} user${filteredUsers.length !== 1 ? "s" : ""}`}
            sx={{ bgcolor: "action.selected", color: "text.secondary", fontSize: 12.5, height: 32, borderRadius: "8px", alignSelf: { xs: "flex-start", sm: "center" }, width: { xs: "100%", sm: "auto" } }}
          />
           */}
          {selectedUserName && (
            <Chip
              label={`User: ${selectedUserName}`}
              onDelete={() => setSelectedUserName(null)}
              size="small"
              sx={{ bgcolor: "#6366f1", color: "white", fontSize: 12, height: 32, borderRadius: "8px" }}
              deleteIcon={<Icon icon="mdi:close" style={{ fontSize: 14, color: "white" }} />}
            />
          )}
          
          {selectedProject && (
            <Chip
              label={`Project: ${selectedProject}`}
              onDelete={() => setSelectedProject("")}
              size="small"
              sx={{ bgcolor: "#10b981", color: "white", fontSize: 12, height: 32, borderRadius: "8px" }}
              deleteIcon={<Icon icon="mdi:close" style={{ fontSize: 14, color: "white" }} />}
            />
          )}
        </Box>

        {/* User cards */}
        {filteredUsers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Icon icon="mdi:account-search-outline" style={{ fontSize: 48, color: "#475569" }} />
            <Typography sx={{ fontSize: 15, color: "text.disabled", mt: 2 }}>No users match your filters.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {filteredUsers.map((user, i) => (
              <UserCard 
                key={user.id} 
                user={user} 
                defaultOpen={i === 0} 
                searchTerm={search}
                selectedProject={selectedProject}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

// ─── Theme Wrapper ────────────────────────────────────────────────────────────

const AdminUserTaskDashboard: React.FC = () => {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const colorMode = useMemo(
    () => ({ toggleColorMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")), mode }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                background: { default: "#f8fafc", paper: "#ffffff" },
                divider: "#e2e8f0",
                text: { primary: "#0f172a", secondary: "#475569", disabled: "#94a3b8" },
                action: {
                  hover: "#f8fafc",
                  selected: "#f1f5f9",
                  disabledBackground: "#e2e8f0",
                },
              }
            : {
                background: { default: "#0f172a", paper: "#1e293b" },
                divider: "#334155",
                text: { primary: "#f1f5f9", secondary: "#94a3b8", disabled: "#475569" },
                action: {
                  hover: "#1e293b",
                  selected: "#334155",
                  disabledBackground: "#334155",
                },
              }),
        },
        typography: { fontFamily: "'Inter', sans-serif" },
        components: {
          MuiPaper:          { styleOverrides: { root: { backgroundImage: "none" } } },
          MuiTableContainer: { styleOverrides: { root: { backgroundImage: "none" } } },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                ...(mode === "dark" && { "&:hover": { backgroundColor: "#334155" } }),
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AdminUserTaskPage />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default AdminUserTaskDashboard;
