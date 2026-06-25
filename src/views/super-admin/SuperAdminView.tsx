"use client"
import React, { useState, createContext, useContext, useMemo, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

// ─── Theme Context ────────────────────────────────────────────────────────────

const ColorModeContext = createContext({ toggleColorMode: () => {} });

// ─── Types ───────────────────────────────────────────────────────────────────

type TaskStatus = string;
type TaskPriority = string;

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

interface Project {
  projectID: number;
  projectName: string;
  isOpen: boolean;
  workspaceName: string;
}

interface UserProject {
  organizationID: number;
  userID: number;
  userName: string;
  organizationName: string;
  totalProjects: number;
  projects: string;
}

interface TaskApiResponse {
  userID: number;
  username: string;
  taskID: number;
  taskname: string;
  taskDescription: string;
  statusname: string;
  statusid: number;
  priorityname: string;
  priorityID: number;
  projectname: string;
  projectID: number;
  taskGroupID: number;
  taskGroupname: string;
  timelinestartdate: string;
  timelineenddate: string;
  workspaceID:number;
  
}

// ─── Config ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; darkBg: string; icon: string }> = {
  todo:        { label: "To Do",       color: "#94a3b8", bg: "#f1f5f9",  darkBg: "#1e293b", icon: "mdi:circle-outline" },
  in_progress: { label: "In Progress", color: "#60a5fa", bg: "#dbeafe",  darkBg: "#1e3a5f", icon: "mdi:progress-clock" },
  review:      { label: "In Review",   color: "#fbbf24", bg: "#fef3c7",  darkBg: "#3d2e00", icon: "mdi:eye-outline" },
  done:        { label: "Done",        color: "#4ade80", bg: "#dcfce7",  darkBg: "#14291e", icon: "mdi:check-circle-outline" },
  blocked:     { label: "Blocked",     color: "#f87171", bg: "#fee2e2",  darkBg: "#2d1515", icon: "mdi:block-helper" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; darkColor: string; icon: string }> = {
  low:      { label: "Low",      color: "#64748b", darkColor: "#94a3b8", icon: "mdi:arrow-down" },
  medium:   { label: "Medium",   color: "#d97706", darkColor: "#fbbf24", icon: "mdi:minus" },
  high:     { label: "High",     color: "#ea580c", darkColor: "#fb923c", icon: "mdi:arrow-up" },
  critical: { label: "Critical", color: "#dc2626", darkColor: "#f87171", icon: "mdi:alert-circle" },
};

const ONLINE_COLOR: Record<User["status"], string> = {
  online:  "#16a34a",
  away:    "#d97706",
  offline: "#94a3b8",
};

// ─── Mapping functions ──────────────────────────────────────────────────────

function mapStatusToConfigKey(statusName: string): string | null {
  const lower = statusName.toLowerCase();
  if (lower.includes("done") || lower.includes("complete")) return "done";
  if (lower.includes("progress") || lower.includes("working")) return "in_progress";
  if (lower.includes("review") || lower.includes("uat") || lower.includes("testing")) return "review";
  if (lower.includes("block") || lower.includes("stuck")) return "blocked";
  if (lower.includes("todo") || lower.includes("open") || lower.includes("new")) return "todo";
  return null;
}

function mapPriorityToConfigKey(priorityName: string): string | null {
  const lower = priorityName.toLowerCase();
  if (lower.includes("utmost") || lower.includes("critical") || lower.includes("highest")) return "critical";
  if (lower.includes("high") || lower.includes("urgent")) return "high";
  if (lower.includes("low") || lower.includes("lowest")) return "low";
  if (lower.includes("medium") || lower.includes("normal")) return "medium";
  return null;
}

// ─── Helper functions ─────────────────────────────────────────────────────────

function getCompletionRate(tasks: Task[]): number {
  if (!tasks.length) return 0;
  const doneCount = tasks.filter(t => mapStatusToConfigKey(t.status) === "done").length;
  return Math.round((doneCount / tasks.length) * 100);
}

function getAvatarColor(name: string): string {
  const palette = ["#6366f1","#0ea5e9","#f59e0b","#10b981","#f43f5e","#8b5cf6","#14b8a6","#ec4899"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function convertApiUserToUser(apiUser: UserProject, index: number, userTasks: TaskApiResponse[]): User {
  const userSpecificTasks = userTasks.filter(task => task.userID === apiUser.userID);
  
  const tasks = userSpecificTasks.map((task, idx) => {
    let dueDateStr: string;
    if (task.timelineenddate && task.timelineenddate.trim() !== "") {
      dueDateStr = task.timelineenddate.split(' ')[0];
    } else {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      dueDateStr = dueDate.toISOString().split('T')[0];
    }

    return {
      id: `${task.taskID}`,
      title: task.taskname || `${task.projectname} - ${task.taskGroupname}`,
      status: task.statusname,
      priority: task.priorityname,
      dueDate: dueDateStr,
      project: task.projectname || "Unassigned",
      workspaceid: task.workspaceID,
      projectID:task?.projectID
    };
  });

  const statuses: ("online" | "offline" | "away")[] = ["online", "offline", "away"];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  const email = `${apiUser.userName.toLowerCase().replace(/\s/g, '')}_${apiUser.userID}@company.io`;
  const initials = apiUser.userName
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  return {
    id: `user_${apiUser.userID}_${index}`,
    name: apiUser.userName,
    email: email,
    role: "Team Member",
    avatar: initials,
    status: randomStatus,
    tasks: tasks,
  };
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const isDark = theme.palette.mode === "dark";

  const statusKey = mapStatusToConfigKey(task.status);
  const priorityKey = mapPriorityToConfigKey(task.priority);

  const statusColor = statusKey ? STATUS_CONFIG[statusKey].color : "#94a3b8";
  const statusBg = isDark
    ? (statusKey ? STATUS_CONFIG[statusKey].darkBg : "#1e293b")
    : (statusKey ? STATUS_CONFIG[statusKey].bg : "#f1f5f9");
  const statusIcon = statusKey ? STATUS_CONFIG[statusKey].icon : "mdi:circle-outline";

  const priorityColor = priorityKey ? PRIORITY_CONFIG[priorityKey].color : "#94a3b8";
  const priorityIcon = priorityKey ? PRIORITY_CONFIG[priorityKey].icon : "mdi:flag-outline";

  const handleTaskClick = (task:any) => {
   // console.log(task,'')
    router.push(`/project/${task?.projectID}`);
    
  };

  return (
    <TableRow
      sx={{
        "&:hover td": { bgcolor: "action.hover" },
        "& td": { border: "none", py: "10px", px: { xs: "8px", md: "14px" } },
        cursor: "pointer",
      }}
      onClick={()=>handleTaskClick(task)}
    >
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon icon={statusIcon} style={{ color: statusColor, fontSize: 16, flexShrink: 0 }} />
          <Typography sx={{ fontSize: { xs: 12, md: 13.5 }, color: "text.primary", fontWeight: 500 }}>
            {task.title}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={task.status}
          size="small"
          sx={{
            bgcolor: statusBg,
            color: statusColor,
            fontWeight: 600, fontSize: { xs: 10, md: 11.5 },
            height: 22, borderRadius: "6px",
          }}
        />
      </TableCell>
      {!isMobile && (
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Icon icon={priorityIcon} style={{ color: priorityColor, fontSize: 14 }} />
            <Typography sx={{ fontSize: 12.5, color: priorityColor, fontWeight: 600 }}>
              {task.priority}
            </Typography>
          </Box>
        </TableCell>
      )}
      {!isMobile && (
        <TableCell >
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const completion = getCompletionRate(user.tasks);
  const avatarColor = getAvatarColor(user.name);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const statusOptions = React.useMemo(() => {
    const statuses = user.tasks.map(t => t.status).filter(Boolean);
    return Array.from(new Set(statuses)).sort();
  }, [user.tasks]);

  // 🔍 Enhanced search: match title, project, priority, or status
  const filteredTasks = user.tasks.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesProject = selectedProject === "" || t.project === selectedProject;
    const matchesSearch = searchTerm === "" || 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.status.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesProject && matchesSearch;
  });

  // Auto‑expand if any task field matches the search
  const hasMatchingSearchTerm = searchTerm !== "" && user.tasks.some(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const hasMatchingProject = selectedProject !== "" && user.tasks.some(t => t.project === selectedProject);
  const shouldBeOpen = defaultOpen || (searchTerm !== "" && hasMatchingSearchTerm) || hasMatchingProject;

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

      <Collapse in={open}>
        <Divider sx={{ borderColor: "divider" }} />
        <Box sx={{ bgcolor: "action.hover", px: { xs: 1.5, md: 3 }, pt: 2, pb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "text.secondary" }}>
              {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} {searchTerm && `matching "${searchTerm}"`} {selectedProject && `in ${selectedProject}`}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status} sx={{ fontSize: 12.5 }}>
                    {status}
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [apiUsers, setApiUsers] = useState<UserProject[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userTasks, setUserTasks] = useState<TaskApiResponse[]>([]);
  const colorMode = useContext(ColorModeContext);
const {user}= useAuth()
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        // const response = await axios.get('https://uat.ppmbackend.projectpulse360.com/GetProjectList?OrganizationID=3');
              const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL1}/GetProjectList?OrganizationID=${user?.userData.OrganizationID}`);
        if (response.data && Array.isArray(response.data)) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const [usersResponse, tasksResponse] = await Promise.all([
          // axios.get('https://uat.ppmbackend.projectpulse360.com/GetUserProjectList?OrganizationID=3'),
          // axios.get('https://uat.ppmbackend.projectpulse360.com/GetUserProjectTaskList?UserID=3')
           axios.get(`${process.env.NEXT_PUBLIC_API_URL1}/GetUserProjectList?OrganizationID=${user?.userData.OrganizationID}`),
           axios.get(`${process.env.NEXT_PUBLIC_API_URL1}/GetUserProjectTaskList?UserID=${user?.userData.OrganizationID}`)
        ]);

        if (usersResponse.data && Array.isArray(usersResponse.data)) {
          setApiUsers(usersResponse.data);
        }

        if (tasksResponse.data && Array.isArray(tasksResponse.data)) {
          setUserTasks(tasksResponse.data);
          const apiUsersConverted = usersResponse.data.map((user:any, index:any) => 
            convertApiUserToUser(user, index, tasksResponse.data)
          );
          const uniqueUsersMap = new Map();
          apiUsersConverted.forEach((user: any) => {
            const key = `${user.name}_${user.id}`;
            if (!uniqueUsersMap.has(key)) {
              uniqueUsersMap.set(key, user);
            }
          });
          setAllUsers(Array.from(uniqueUsersMap.values()));
        } else {
          const apiUsersConverted = usersResponse.data.map((user:any, index:any) => 
            convertApiUserToUser(user, index, [])
          );
          const uniqueUsersMap = new Map();
          apiUsersConverted.forEach((user:any) => {
            const key = `${user.name}_${user.id}`;
            if (!uniqueUsersMap.has(key)) {
              uniqueUsersMap.set(key, user);
            }
          });
          setAllUsers(Array.from(uniqueUsersMap.values()));
        }
      } catch (error) {
        console.error('Error fetching users or tasks:', error);
        setAllUsers([]);
        setUserTasks([]);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const allUserNames = Array.from(new Set(allUsers.map(user => user.name))).filter(name => name && name.trim() !== "").sort();
  const apiProjectNames = projects.map(project => project.projectName).filter(name => name && name.trim() !== "");
  const userProjectNames = allUsers.flatMap(user => user.tasks.map(task => task.project));
  const allProjects = Array.from(new Set([...userProjectNames, ...apiProjectNames])).sort();

  // 🔍 Enhanced global search: match user name, email, and task fields (title, project, priority, status)
  const filteredUsers = allUsers.filter((u) => {
    const matchUser = selectedUserName === null || u.name === selectedUserName;
    const matchProject = selectedProject === "" || u.tasks.some(t => t.project === selectedProject);
    const matchSearch = search === "" || 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.tasks.some(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.project.toLowerCase().includes(search.toLowerCase()) ||
        t.priority.toLowerCase().includes(search.toLowerCase()) ||
        t.status.toLowerCase().includes(search.toLowerCase())
      );
    return matchUser && matchProject && matchSearch;
  });

  const allTasks = allUsers.flatMap((u) => u.tasks);
  const filteredTasks = selectedProject === "" 
    ? allTasks 
    : allTasks.filter(t => t.project === selectedProject);
  
  const totalDone = filteredTasks.filter(t => mapStatusToConfigKey(t.status) === "done").length;
  const totalBlocked = filteredTasks.filter(t => mapStatusToConfigKey(t.status) === "blocked").length; // kept for logic, not displayed
  const totalInProgress = filteredTasks.filter(t => mapStatusToConfigKey(t.status) === "in_progress").length;
  const overallCompletion = filteredTasks.length > 0 ? Math.round((totalDone / filteredTasks.length) * 100) : 0;
  const projectTasksCount = filteredTasks.length;

  if (usersLoading || projectsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", fontFamily: "'Inter', sans-serif" }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          py: { xs: 3, md: 4, lg: 5 },
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 20, md: 22 }, color: "text.primary", letterSpacing: "-0.4px" }}>
            Team Overview
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: "text.secondary", mt: 0.4 }}>
            Monitor all users, their tasks, priorities, and progress in one place.
          </Typography>
        </Box>

        {/* Stats row – 4 cards (Blocked removed) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <StatCard icon="mdi:account-group-outline" label="Total Members" value={allUsers.length} accent="#6366f1" />
          <StatCard 
            icon="mdi:checkbox-marked-circle-outline" 
            label="Tasks Done" 
            value={`${totalDone} / ${projectTasksCount}`} 
            accent="#16a34a" 
          />
          <StatCard icon="mdi:progress-clock" label="In Progress" value={totalInProgress} accent="#2563eb" />
          <StatCard icon="mdi:chart-line" label="Overall Completion" value={`${overallCompletion}%`} accent="#f59e0b" />
        </Box>

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
            placeholder="Search by name,email,task,project,status,priority and etc...."
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
            loading={projectsLoading}
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
            options={allUserNames}
            value={selectedUserName}
            onChange={(event, newValue) => setSelectedUserName(newValue)}
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 200 }, flex: { xs: "none", sm: "0 0 auto" } }}
            loading={usersLoading}
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

        {filteredUsers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Icon icon="mdi:account-search-outline" style={{ fontSize: 48, color: "#475569" }} />
            <Typography sx={{ fontSize: 15, color: "text.disabled", mt: 2 }}>No users match your filters.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {filteredUsers.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
                defaultOpen={false} 
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

  const { profile,setUser,user } = useAuth()
  console.log(user?.userData.OrganizationID,'fff');
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
