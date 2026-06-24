// src/app/(dashboard)/your-feature/page.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  Typography, 
  Box, 
  Button, 
  TextField,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Grid,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  Tooltip
} from '@mui/material'
import { Icon } from '@iconify/react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import TaskColumn from './TaskColumn'
import { NewTaskDialog } from '../../views/project/main-screen/Taskboard'
import axios from 'axios'
import { useAuth } from '@/hooks/useAuth'
import toast, { Toaster } from 'react-hot-toast'
import { useProject } from '@/context/project-context'
import type { ProjectUsers, User } from '@/services/modules/invite/types'

const Baseurl = process.env.NEXT_PUBLIC_API_URL1

interface Task {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  assignee: string
  taskID?: number
  priorityID?: number
  priorityName?: string
  priorityColorCode?: string
  projectTaskID?: number
  createDate?: string
  attachmentLink?: string
  categoryID?: number
  categoryName?: string
}

interface TaskColumns {
  todo: Task[]
  inProgress: Task[]
  review: Task[]
  done: Task[]
  [key: string]: Task[] // Allow dynamic keys for new categories
}

interface Column {
  id: string
  title: string
  color: string
  icon: string
  iconColor: string
  lightBg: string
  count: number
  boardCategoryID?: number // Add API ID field
  categoryID?: number // API category ID
}

// Interface for API response
interface ApiTaskItem {
  taskID: number
  taskTitle: string
  taskDescription: string
  priorityID: number
  priorityName: string
  priorityColorCode: string
  assignedTo: string
  projectTaskID: number
  createDate: string
  attachmentLink: string
  categoryID: number
  categoryName: string
}

interface ApiCategory {
  categoryID: number
  categoryname: string
  categoryColorCode: string
  details: ApiTaskItem[]
}

// Filter types
interface FilterOptions {
  priority: ('high' | 'medium' | 'low')[]
  assignee: string[]
  category: string[]
}

// Add priority interface
interface ApiPriority {
  priorityID: number
  priorityname: string
  colorcode: string
}

// Task Details Dialog Component
const TaskDetailsDialog = ({ 
  open, 
  onClose, 
  task 
}: { 
  open: boolean; 
  onClose: () => void; 
  task: Task | null;
}) => {
  const theme = useTheme();

  if (!task) return null;

  const getPriorityColor = () => {
    if (task.priorityColorCode) return task.priorityColorCode;
    return task.priority === 'high' ? '#ff0000' : 
           task.priority === 'medium' ? '#FF9800' : '#4CAF50';
  };

  const getPriorityName = () => {
    return task.priorityName || task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const pathname = new URL(url).pathname;
      const filename = pathname.split('/').pop();
      return decodeURIComponent(filename || 'Attachment');
    } catch {
      const parts = url.split('/');
      return decodeURIComponent(parts[parts.length - 1].split('?')[0] || 'Attachment');
    }
  };

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'mdi:file-pdf-box';
      case 'doc':
      case 'docx':
        return 'mdi:file-word-box';
      case 'xls':
      case 'xlsx':
        return 'mdi:file-excel-box';
      case 'ppt':
      case 'pptx':
        return 'mdi:file-powerpoint-box';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'mdi:file-image-box';
      case 'zip':
      case 'rar':
        return 'mdi:folder-zip';
      default:
        return 'mdi:file-document-box';
    }
  };

  // Function to download attachment directly
  const handleDownloadAttachment = (url: string) => {
    try {
      const fileName = getFileNameFromUrl(url);
      const link = document.createElement('a');
      
      // Create proper download URL
      let downloadUrl = url;
      
      // Check if URL needs protocol
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('blob:')) {
        // If it's a relative URL starting with /
        if (url.startsWith('/')) {
          downloadUrl = `${window.location.origin}${url}`;
        } else if (url.startsWith('./') || url.startsWith('../')) {
          // Handle relative URLs
          const baseUrl = window.location.href;
          const urlObj = new URL(url, baseUrl);
          downloadUrl = urlObj.href;
        } else {
          // Assume it's a path relative to current domain
          downloadUrl = `${window.location.origin}/${url}`;
        }
      }
      
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started', {
        position: 'top-center',
        duration: 3000,
        style: {
          background: 'white',
          color: 'black',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: 500,
        },
      });
    } catch (error) {
      console.error('Download error:', error);
      // Fallback - open in new tab
      window.open(task.attachmentLink, '_blank');
      
      toast.info('Opening file in new tab', {
        position: 'top-center',
        duration: 3000,
        style: {
          background: 'white',
          color: 'black',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: 500,
        },
      });
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ 
        fontWeight: 600, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        pr: 8
      }}>
        <Box sx={{ 
          width: 8, 
          height: 40, 
          borderRadius: 1,
          backgroundColor: getPriorityColor(),
          flexShrink: 0
        }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ lineHeight: 1.2, mb: 0.5 }}>
            {task.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="textSecondary">
            </Typography>
            {task.createDate && (
              <Typography variant="caption" color="textSecondary">
                Created: <strong>{task.createDate}</strong>
              </Typography>
            )}
            
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Grid container spacing={3}>
          {/* Left Column - Main Content */}
          <Grid item xs={12} md={8}>
            {/* Description Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: theme.palette.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Icon icon="mdi:text-box-outline" width={20} />
                Description
              </Typography>
              <Paper 
                sx={{ 
                  p: 3, 
                  bgcolor: theme.palette.background.default,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="body2" sx={{ 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: 1.6,
                  color: theme.palette.text.primary
                }}>
                  {task.description || 'No description provided'}
                </Typography>
              </Paper>
            </Box>

            {/* Attachments Section */}
            {task.attachmentLink && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  color: theme.palette.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Icon icon="mdi:paperclip" width={20} />
                  Attachments
                </Typography>
                <Paper 
                  sx={{ 
                    p: 2.5, 
                    bgcolor: theme.palette.background.default,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      borderColor: theme.palette.primary.main
                    }
                  }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon 
                        icon={getFileIcon(task.attachmentLink)} 
                        style={{ 
                          color: theme.palette.primary.main, 
                          fontSize: 28 
                        }} 
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {getFileNameFromUrl(task.attachmentLink)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Click to download or view
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                      <Tooltip title="Preview">
                        <IconButton
                          size="small"
                          onClick={() => window.open(task.attachmentLink, '_blank')}
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main
                            }
                          }}
                        >
                          <Icon icon="mdi:eye-outline" width={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadAttachment(task.attachmentLink!)}
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main
                            }
                          }}
                        >
                          <Icon icon="mdi:download" width={20} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
          </Grid>

          {/* Right Column - Metadata */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: theme.palette.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Icon icon="mdi:information-outline" width={20} />
              Task Details
            </Typography>
            
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: theme.palette.background.default,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2.5
              }}>
                {/* Priority */}
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ 
                    fontWeight: 500, 
                    mb: 1, 
                    display: 'block',
                    fontSize: '0.75rem'
                  }}>
                    Priority
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: alpha(getPriorityColor(), 0.08),
                    border: `1px solid ${alpha(getPriorityColor(), 0.2)}`
                  }}>
                    <Box sx={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%',
                      backgroundColor: getPriorityColor(),
                      flexShrink: 0
                    }} />
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      textTransform: 'capitalize',
                      color: theme.palette.text.primary
                    }}>
                      {getPriorityName()}
                    </Typography>

                  </Box>
                </Box>

                {/* Assignee */}
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ 
                    fontWeight: 500, 
                    mb: 1, 
                    display: 'block',
                    fontSize: '0.75rem'
                  }}>
                    Assignee
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: theme.palette.primary.main,
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {task.assignee?.charAt(0) || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: theme.palette.text.primary
                      }}>
                        {task.assignee || 'Unassigned'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Assigned
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Category */}
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ 
                    fontWeight: 500, 
                    mb: 1, 
                    display: 'block',
                    fontSize: '0.75rem'
                  }}>
                    Category
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <Icon 
                      icon="mdi:format-list-bulleted-type" 
                      style={{ 
                        color: theme.palette.text.secondary,
                        fontSize: 20
                      }} 
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.primary
                      }}>
                        {task.categoryName || 'No Category'}
                      </Typography>
                      
                    </Box>
                  </Box>
                </Box>

                {/* Additional Info */}
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ 
                    fontWeight: 500, 
                    mb: 1, 
                    display: 'block',
                    fontSize: '0.75rem'
                  }}>
                    Additional Information
                  </Typography>
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 1.5
                  }}>
                    {/* Task ID */}
                   

                    {/* Project Task ID */}
                  

                    {/* Create Date */}
                    <Box sx={{ 
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                        Created Date
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.primary
                      }}>
                        {task.createDate || 'N/A'}
                      </Typography>
                    </Box>

                    {/* Status */}
                    {/* <Box sx={{ 
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                        Status
                      </Typography>
                      <Chip
                        label="Active"
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                    </Box> */}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        pt: 2, 
        borderTop: `1px solid ${theme.palette.divider}`,
        gap: 1
      }}>
        <Button 
          onClick={onClose}
          sx={{ 
            fontWeight: 500,
            color: theme.palette.text.secondary
          }}
        >
          Close
        </Button>
        {task.attachmentLink && (
          <Button 
            variant="contained"
            onClick={() => handleDownloadAttachment(task.attachmentLink!)}
            startIcon={<Icon icon="mdi:download" />}
            sx={{ fontWeight: 500 }}
          >
            Download Attachment
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const YourFeaturePage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
 // const teamMembers = ['John Doe', 'Jane Smith', 'Bob Johnson']
  const { users, role } = useProject()
  const [searchText, setSearchText] = useState('')
const [teamMembers, setTeamMembers] = useState<string[]>([])  // Loading states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teamMembersLoading, setTeamMembersLoading] = useState(false)
  const userFilter = useCallback(
    (user: ProjectUsers) => {
      return user?.User?.Name?.toLowerCase()?.includes(searchText?.toLowerCase())
    },
    [searchText]
  )
  // Interface for team members API response
interface ApiTeamMember {
  userID: number
  name: string
  email: string
  profilepicture: string
}
// Fetch team members from API - ADDED FUNCTION
const fetchTeamMembers = async () => {
  if (!user?.id) return;
  
  setTeamMembersLoading(true);
  try {
    const response = await axios.get(`${Baseurl}/GetBoardUserList?LoginuserID=${user.id}`);
    
    if (response.data && Array.isArray(response.data)) {
      // Remove duplicates based on userID and map to just names
      const uniqueMembers = response.data.reduce((acc: ApiTeamMember[], current: ApiTeamMember) => {
        const exists = acc.find(item => item.userID === current.userID);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      // Extract just the names for the teamMembers array
      const memberNames = uniqueMembers.map((member: ApiTeamMember) => member.name);
      setTeamMembers(memberNames);
    }
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    toast.error('Failed to load team members from API', {
      position: 'top-center',
      duration: 4000,
      style: {
        background: 'white',
        color: 'black',
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        maxWidth: '400px',
        fontSize: '14px',
        fontWeight: 500,
      },
    });
    // Fallback to empty array
    setTeamMembers([]);
  } finally {
    setTeamMembersLoading(false);
  }
}

  // Edit states
  const [editCategoryDialog, setEditCategoryDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Column | null>(null)
  const [editTaskDialog, setEditTaskDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingTaskColumn, setEditingTaskColumn] = useState<string | null>(null)
  
  // Delete states
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Column | null>(null)
  
  // Create category states
  const [createCategoryDialog, setCreateCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#2196F3') // Default primary color
  
  // Filter states - UPDATED: Changed to store priority names instead of mapped values
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    priority: [],
    assignee: [],
    category: []
  })
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(new Set()) // Changed to Set<string>
  const [selectedAssignees, setSelectedAssignees] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  
  // Validation errors for create category
  const [categoryValidationErrors, setCategoryValidationErrors] = useState<{name?: string, color?: string}>({})
  const [categoryLoading, setCategoryLoading] = useState(false)

  // Task Details Dialog State
  const [taskDetailsDialog, setTaskDetailsDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Priority states - ADDED
  const [priorities, setPriorities] = useState<ApiPriority[]>([])
  const [priorityLoading, setPriorityLoading] = useState(false)

  // File upload state for edit task
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Get icon based on category name
  const getCategoryIcon = (categoryName: string) => {
    const icons: Record<string, string> = {
      'todo': 'mdi:clipboard-list-outline',
      'inprogress': 'mdi:progress-clock',
      'review': 'mdi:eye-check-outline',
      'done': 'mdi:checkbox-marked-circle-outline',
      'backlog': 'mdi:clock-outline',
      'blocked': 'mdi:alert-circle-outline',
      'testing': 'mdi:test-tube',
      'deployed': 'mdi:rocket-launch-outline',
      'category': 'mdi:format-list-checks',
      'dd': 'mdi:dots-horizontal-circle',
      'valeu': 'mdi:check-circle-outline',
      'tod': 'mdi:clipboard-list-outline',
      'tdo': 'mdi:clipboard-list-outline',
    }
    
    const defaultIcons = [
      'mdi:format-list-checks',
      'mdi:checkbox-multiple-marked-outline',
      'mdi:clipboard-check-outline',
      'mdi:clipboard-flow-outline',
      'mdi:clipboard-text-outline',
    ]
    
    const key = categoryName.toLowerCase().replace(/\s+/g, '')
    return icons[key] || defaultIcons[Math.floor(Math.random() * defaultIcons.length)]
  }

  // Initialize with empty tasks - will be populated from API
  const [tasks, setTasks] = useState<TaskColumns>({
    todo: [],
    inProgress: [],
    review: [],
    done: []
  })

  // Initialize with empty array - will be populated from API
  const [columns, setColumns] = useState<Column[]>([])

  // Helper function to convert priority name to priority level
  const getPriorityLevel = (priorityName: string): 'high' | 'medium' | 'low' => {
    if (!priorityName) return 'medium'
    
    const lowerPriority = priorityName.toLowerCase()
    if (lowerPriority.includes('high')) return 'high'
    if (lowerPriority.includes('low')) return 'low'
    if (lowerPriority.includes('medium')) return 'medium'
    
    // Fallback: check for any other patterns
    if (lowerPriority.includes('urgent') || lowerPriority.includes('critical')) return 'high'
    if (lowerPriority.includes('minor') || lowerPriority.includes('trivial')) return 'low'
    
    return 'medium'
  }

  // Fetch priorities from API - ADDED FUNCTION
  const fetchPriorities = async () => {
    setPriorityLoading(true)
    try {
      const response = await axios.get(`${Baseurl}/GetBoardPriorityList?LoginuserID=${user?.id}`)
      
      if (response.data && Array.isArray(response.data)) {
        setPriorities(response.data)
      }
    } catch (error: any) {
      console.error('Error fetching priorities:', error)
      toast.error('Failed to load priorities from API', {
        position: 'top-center',
        duration: 4000,
        style: {
          background: 'white',
          color: 'black',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: 500,
        },
      })
    } finally {
      setPriorityLoading(false)
    }
  }

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${Baseurl}/GetBoardTaskList?LoginuserID=${user?.id}`)
      
      if (response.data && Array.isArray(response.data)) {
        const apiTasks: TaskColumns = {}
        
        // Start by creating empty arrays for all existing columns
        columns.forEach(col => {
          apiTasks[col.id] = []
        })
        
        // Process each category from API response
        response.data.forEach((category: ApiCategory) => {
          // Generate column ID from category name - MUST MATCH THE SAME LOGIC AS IN fetchCategories
          const columnId = category.categoryname.toLowerCase().replace(/\s+/g, '')
          
          // Map API tasks to Task format
          const categoryTasks: Task[] = category.details.map((item: ApiTaskItem) => ({
            id: item.taskID.toString(),
            title: item.taskTitle,
            description: item.taskDescription,
            priority: getPriorityLevel(item.priorityName),
            assignee: item.assignedTo,
            taskID: item.taskID,
            priorityID: item.priorityID,
            priorityName: item.priorityName,
            priorityColorCode: item.priorityColorCode,
            projectTaskID: item.projectTaskID,
            createDate: item.createDate,
            attachmentLink: item.attachmentLink,
            categoryID: item.categoryID,
            categoryName: item.categoryName
          }))
          
          // Add tasks to the tasks object
          // If the column doesn't exist in apiTasks yet, create it
          if (!apiTasks[columnId]) {
            apiTasks[columnId] = []
          }
          apiTasks[columnId] = categoryTasks
        })
        
        // Update tasks state - this will preserve any columns that don't have tasks yet
        setTasks(prevTasks => {
          const mergedTasks = { ...prevTasks }
          
          // Update with API data
          Object.keys(apiTasks).forEach(key => {
            mergedTasks[key] = apiTasks[key]
          })
          
          return mergedTasks
        })
        
      }
    } catch (error: any) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks from API', {
        position: 'top-center',
        duration: 4000,
        style: {
          background: 'white',
          color: 'black',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: 500,
        },
      })
    }
  }

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${Baseurl}/GetBoardList?LoginuserID=${user?.id}`)
      
      if (response.data && Array.isArray(response.data)) {
        // Map API response to Column format
        const apiColumns: Column[] = response.data.map((item: any) => {
          // Generate ID from category name (lowercase, no spaces) - MUST MATCH THE SAME LOGIC AS IN fetchTasks
          const columnId = item.categoryname.toLowerCase().replace(/\s+/g, '')
          
          return {
            id: columnId,
            title: item.categoryname,
            color: item.colorCode || '#2196F3',
            icon: getCategoryIcon(item.categoryname),
            iconColor: item.colorCode || '#2196F3',
            lightBg: alpha(item.colorCode || '#2196F3', 0.08),
            count: 0, // Will be updated when tasks are fetched
            boardCategoryID: item.boardCategoryID,
            categoryID: item.boardCategoryID
          }
        })
        
        setColumns(apiColumns)
        
        // Initialize empty task arrays for any new categories from API
        const updatedTasks = { ...tasks }
        apiColumns.forEach(col => {
          if (!updatedTasks[col.id]) {
            updatedTasks[col.id] = []
          }
        })
        setTasks(updatedTasks)
        
        // Fetch tasks after categories are loaded
        await fetchTasks()
        
      } else {
        throw new Error('Invalid API response format')
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error)
      setError('Failed to load categories from API')
      
      toast.error('Failed to load categories from API', {
        position: 'top-center',
        duration: 4000,
        style: {
          background: 'white',
          color: 'black',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: 500,
        },
      })
      
      // Fallback to default columns if API fails
      const defaultColumns: Column[] = [
        { 
          id: 'todo', 
          title: 'To Do', 
          color: '#2196F3', // Primary color
          icon: 'mdi:clipboard-list-outline',
          iconColor: '#2196F3',
          lightBg: alpha('#2196F3', 0.08),
          count: 0
        },
        { 
          id: 'inprogress', 
          title: 'In Progress', 
          color: '#FF9800', // Warning color
          icon: 'mdi:progress-clock',
          iconColor: '#FF9800',
          lightBg: alpha('#FF9800', 0.08),
          count: 0
        },
        { 
          id: 'review', 
          title: 'Review', 
          color: '#00BCD4', // Info color
          icon: 'mdi:eye-check-outline',
          iconColor: '#00BCD4',
          lightBg: alpha('#00BCD4', 0.08),
          count: 0
        },
        { 
          id: 'done', 
          title: 'Done', 
          color: '#4CAF50', // Success color
          icon: 'mdi:checkbox-marked-circle-outline',
          iconColor: '#4CAF50',
          lightBg: alpha('#4CAF50', 0.08),
          count: 0
        }
      ]
      setColumns(defaultColumns)
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories on component mount
useEffect(() => {
  const fetchAllData = async () => {
    await Promise.all([
      fetchCategories(),
      fetchPriorities(),
      fetchTeamMembers() // Added team members fetch
    ]);
  };
  
  fetchAllData();
}, [])

  // Update columns count when tasks change
  useEffect(() => {
    const updatedColumns = columns.map(col => ({
      ...col,
      count: tasks[col.id]?.length || 0
    }))
    setColumns(updatedColumns)
  }, [tasks])

  // Get all unique assignees from tasks
  const allAssignees = useMemo(() => {
    const assignees = new Set<string>()
    Object.values(tasks).forEach(columnTasks => {
      columnTasks.forEach(task => {
        if (task.assignee) {
          assignees.add(task.assignee)
        }
      })
    })
    return Array.from(assignees)
  }, [tasks])

  // Get filtered tasks based on search and filter options - UPDATED for priority filtering
  const getFilteredTasks = useCallback((columnTasks: Task[], columnId: string) => {
    return columnTasks.filter(task => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.assignee.toLowerCase().includes(searchLower) ||
          task.priority.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }

      // Priority filter - FIXED: Compare priority names from API, not mapped values
      if (selectedPriorities.size > 0) {
        const taskPriorityName = task.priorityName || task.priority;
        const isPriorityMatch = Array.from(selectedPriorities).some(selectedPriority => {
          // Normalize both strings for comparison
          const normalizedTaskPriority = taskPriorityName.toLowerCase().trim();
          const normalizedSelectedPriority = selectedPriority.toLowerCase().trim();
          return normalizedTaskPriority === normalizedSelectedPriority;
        });
        
        if (!isPriorityMatch) return false;
      }

      // Assignee filter
      if (selectedAssignees.size > 0 && !selectedAssignees.has(task.assignee)) {
        return false
      }

      // Category filter
      if (selectedCategories.size > 0 && !selectedCategories.has(columnId)) {
        return false
      }

      return true
    })
  }, [searchQuery, selectedPriorities, selectedAssignees, selectedCategories])

  // Get filtered columns with filtered tasks
  const columnsWithFilteredTasks = useMemo(() => {
    return columns.map(col => ({
      ...col,
      count: getFilteredTasks(tasks[col.id] || [], col.id).length,
      filteredTasks: getFilteredTasks(tasks[col.id] || [], col.id)
    }))
  }, [columns, tasks, getFilteredTasks])

  const totalTasks = Object.values(tasks).reduce((sum, columnTasks) => sum + columnTasks.length, 0)
  const totalFilteredTasks = columnsWithFilteredTasks.reduce((sum, col) => sum + col.count, 0)

  // const handleDrop = (taskId: string, columnId: string) => {
  //   let taskToMove: Task | null = null
  //   let sourceColumn: string = ''
    
  //   Object.entries(tasks).forEach(([colId, columnTasks]) => {
  //     const task = columnTasks.find(t => t.id === taskId)
  //     if (task) {
  //       taskToMove = task
  //       sourceColumn = colId
  //     }
  //   })

  //   if (taskToMove && sourceColumn !== columnId) {
  //     const updatedTasks = { ...tasks }
  //     updatedTasks[sourceColumn] = updatedTasks[sourceColumn].filter(t => t.id !== taskId)
  //     if (!updatedTasks[columnId]) {
  //       updatedTasks[columnId] = []
  //     }
  //     updatedTasks[columnId] = [...updatedTasks[columnId], taskToMove]
  //     setTasks(updatedTasks)
  //   }
  // }
const handleDrop = async (taskId: string, columnId: string) => {
  let taskToMove: Task | null = null
  let sourceColumn: string = ''
  
  Object.entries(tasks).forEach(([colId, columnTasks]) => {
    const task = columnTasks.find(t => t.id === taskId)
    if (task) {
      taskToMove = task
      sourceColumn = colId
    }
  })

  if (taskToMove && sourceColumn !== columnId) {
    try {
      // Find the destination category ID
      const destinationColumn = columns.find(col => col.id === columnId)
      const destinationCategoryID = destinationColumn?.boardCategoryID
      
      if (!destinationCategoryID) {
        throw new Error('Destination category not found')
      }

      // Call the API to move the task
      const apiUrl = `${Baseurl}/MoveTaskToanotherCategory?BoardTaskID=${taskToMove.taskID}&LoginuserID=${user?.id}&DestinationCategoryID=${destinationCategoryID}`
      
      const response = await axios.post(apiUrl)
      
      if (response.data) {
        // API call successful, update local state
        const updatedTasks = { ...tasks }
        updatedTasks[sourceColumn] = updatedTasks[sourceColumn].filter(t => t.id !== taskId)
        if (!updatedTasks[columnId]) {
          updatedTasks[columnId] = []
        }
        updatedTasks[columnId] = [...updatedTasks[columnId], taskToMove]
        setTasks(updatedTasks)
        
        toast.success('Task moved successfully', {
          position: 'top-center',
          duration: 4000,
          style: {
            background: 'white',
            color: 'black',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: 500,
          },
        })
        
        // Refresh data from API to ensure consistency
        await fetchCategories()
      } else {
        throw new Error('Failed to move task')
      }
    } catch (error: any) {
      console.error('Error moving task:', error)
      
      let errorMessage = 'Failed to move task'
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`
      } else if (error.request) {
        errorMessage = 'Network error: No response from server'
      } else {
        errorMessage = error.message || 'Unknown error occurred'
      }
      
      toast.error(errorMessage, {
        position: 'top-center',
        duration: 4000,
        style: {
          background: 'white',
          color: 'black',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: 500,
        },
      })
    }
  }
}
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    setFilterAnchorEl(null)
  }

  const handleSubmit = async (taskData: any) => {
    // Your API call or logic here
  }

  // Filter handlers - UPDATED: handlePriorityFilter now accepts string
  const handlePriorityFilter = (priority: string) => {
    const newSelectedPriorities = new Set(selectedPriorities)
    if (newSelectedPriorities.has(priority)) {
      newSelectedPriorities.delete(priority)
    } else {
      newSelectedPriorities.add(priority)
    }
    setSelectedPriorities(newSelectedPriorities)
  }

  const handleAssigneeFilter = (assignee: string) => {
    const newSelectedAssignees = new Set(selectedAssignees)
    if (newSelectedAssignees.has(assignee)) {
      newSelectedAssignees.delete(assignee)
    } else {
      newSelectedAssignees.add(assignee)
    }
    setSelectedAssignees(newSelectedAssignees)
  }

  const handleCategoryFilter = (categoryId: string) => {
    const newSelectedCategories = new Set(selectedCategories)
    if (newSelectedCategories.has(categoryId)) {
      newSelectedCategories.delete(categoryId)
    } else {
      newSelectedCategories.add(categoryId)
    }
    setSelectedCategories(newSelectedCategories)
  }

  const clearAllFilters = () => {
    setSelectedPriorities(new Set())
    setSelectedAssignees(new Set())
    setSelectedCategories(new Set())
    setSearchQuery('')
    handleFilterClose()
  }

  // Create Category handlers
  const handleOpenCreateCategory = () => {
     const paymentStatus = localStorage.getItem('paymentStatus')
    setNewCategoryName('')
    setSelectedColor('#2196F3')
    setCategoryValidationErrors({})

    setCreateCategoryDialog(true)

  }
  

//   const checkPaymentStatus = () => {
//   const paymentStatus = localStorage.getItem('paymentStatus')
//   try {
//     if (paymentStatus) {
//       const parsed = JSON.parse(paymentStatus)
//       // If parsed explicitly says expired, show payment dialog and disallow opening the Task Group dialog
//       if (parsed.isExpired === true) {
//         setCreateCategoryDialog(true)
//         return false
//       }
      
//       if (parsed?.boardsectionCount == 1 && projects.length >= 1) {
//         setCreateCategoryDialog(true)
//         return false
//       }
      
//       // If parsed explicitly says not expired, ensure payment dialog is hidden and allow opening Task Group dialog
//       if (parsed.isExpired === false) {
//         setCreateCategoryDialog(false)
//         return true
//       }
//       // In case parsed.isExpired is missing or unexpected, be conservative: treat as expired
//       setCreateCategoryDialog(true)
//       return false
//     }
//     // No stored status → treat as expired by default (user must renew)
//     setCreateCategoryDialog(true)
//     return false
//   } catch (error) {
//     console.error('Error parsing payment status:', error)
//     // On parse error, treat as expired to be safe
//     setCreateCategoryDialog(true)
//     return false
//   }
// }


  const handleCreateCategory = async () => {
    // Clear previous validation errors
    setCategoryValidationErrors({})
    
    let hasError = false
    const errors: {name?: string, color?: string} = {}

    // Validate category name
    if (!newCategoryName.trim()) {
      errors.name = 'Category name is required'
      hasError = true
    } else if (newCategoryName.length > 50) {
      errors.name = 'Category name must be less than 50 characters'
      hasError = true
    }

    // Validate category name already exists
    const newId = newCategoryName.toLowerCase().replace(/\s+/g, '')
    if (columns.find(col => col.id === newId)) {
      errors.name = 'Category with this name already exists'
      hasError = true
    }

    // Validate color format
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (!colorRegex.test(selectedColor)) {
      errors.color = 'Invalid color format. Use hex format like #2196F3'
      hasError = true
    }

    if (hasError) {
      setCategoryValidationErrors(errors)
      return
    }

    setCategoryLoading(true)

    try {
      // Prepare API request parameters
      const colorCode = encodeURIComponent(selectedColor) // URL encode the color code
      
      // Make API call to create board category
      const apiUrl = `${Baseurl}/CreateBoardCategory?Categoryname=${encodeURIComponent(newCategoryName)}&ColorCode=${colorCode}&LoginuserID=${user?.id}`
      
      const response = await axios.post(apiUrl)
      
      // Check if API call was successful
      if (response.data) {
        // Refresh categories from API after successful creation
        await fetchCategories()
        
        setCreateCategoryDialog(false)
        setNewCategoryName('')
        setSelectedColor('#2196F3')
        setCategoryValidationErrors({})
        
        toast.success('Category created successfully', {
          position: 'top-center',
          duration: 4000,
          style: {
            background: 'white',
            color: 'black',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: 500,
          },
        })
      } else {
        throw new Error('Failed to create category')
      }
    } catch (error: any) {
      console.error('Error creating category:', error)
      
      // Handle specific error cases
      let errorMessage = 'Failed to create category'
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`
        
        // Handle duplicate category error from server
        if (error.response.status === 400 || (error.response.data?.message && error.response.data.message.toLowerCase().includes('already exists'))) {
          setCategoryValidationErrors({ name: 'Category with this name already exists on the server' })
        }
      } else if (error.request) {
        // Request made but no response received
        errorMessage = 'Network error: No response from server'
      } else {
        // Something else happened
        errorMessage = error.message || 'Unknown error occurred'
      }
      
      // Only show toast if there's no field-specific error
      if (!categoryValidationErrors.name) {
        toast.error(errorMessage, {
          position: 'top-center',
          duration: 4000,
          style: {
            background: 'white',
            color: 'black',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: 500,
          },
        })
      }
    } finally {
      setCategoryLoading(false)
    }
  }

  const handleCloseCreateCategoryDialog = () => {
    setCreateCategoryDialog(false)
    setCategoryValidationErrors({})
    setNewCategoryName('')
    setSelectedColor('#2196F3')
  }

  // Edit Category handlers
  const handleEditCategory = (column: Column) => {
    setEditingCategory(column)
    setEditCategoryDialog(true)
  }

  const handleSaveCategory = async () => {
    if (editingCategory) {
      try {
        // Prepare API request parameters for update
        const colorCode = encodeURIComponent(editingCategory.color) // URL encode the color code
        
        // Make API call to update board category
        const apiUrl = `${Baseurl}/UpdateBoardCategory?Categoryname=${encodeURIComponent(editingCategory.title)}&ColorCode=${colorCode}&LoginuserID=${user?.id}&CategoryID=${editingCategory.boardCategoryID}`
        
        const response = await axios.post(apiUrl)
        
        // Check if API call was successful
        if (response.data) {
          // Refresh categories from API after successful update
          await fetchCategories()
          
          setEditCategoryDialog(false)
          setEditingCategory(null)
          
          toast.success('Category updated successfully', {
            position: 'top-center',
            duration: 4000,
            style: {
              background: 'white',
              color: 'black',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              maxWidth: '400px',
              fontSize: '14px',
              fontWeight: 500,
            },
          })
        } else {
          throw new Error('Failed to update category')
        }
      } catch (error: any) {
        console.error('Error updating category:', error)
        
        // Handle specific error cases
        let errorMessage = 'Failed to update category'
        
        if (error.response) {
          // Server responded with error status
          errorMessage = error.response.data?.message || `Server error: ${error.response.status}`
        } else if (error.request) {
          // Request made but no response received
          errorMessage = 'Network error: No response from server'
        } else {
          // Something else happened
          errorMessage = error.message || 'Unknown error occurred'
        }
        
        toast.error(errorMessage, {
          position: 'top-center',
          duration: 4000,
          style: {
            background: 'white',
            color: 'black',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: 500,
          },
        })
      }
    }
  }

  // Delete Category handlers
  const handleDeleteCategory = (column: Column) => {
    setCategoryToDelete(column)
    setDeleteCategoryDialog(true)
  }

  const handleConfirmDeleteCategory = async () => {
    if (categoryToDelete) {
      // Check if there are tasks in the category
      const tasksInCategory = tasks[categoryToDelete.id] || []
      
      if (tasksInCategory.length > 0) {
        toast.error(`Cannot delete category with ${tasksInCategory.length} task(s). Move or delete tasks first.`, {
          position: 'top-center',
          duration: 4000,
          style: {
            background: 'white',
            color: 'black',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: 500,
          },
        })
        setDeleteCategoryDialog(false)
        setCategoryToDelete(null)
        return
      }

      try {
        // Check if category has an ID from API
        if (!categoryToDelete.boardCategoryID) {
          throw new Error('Category does not have a valid ID')
        }

        const apiUrl = `${Baseurl}/RemoveBoardCategory?LoginuserID=${user?.id}&CategoryID=${categoryToDelete.boardCategoryID}`
        
        const response = await axios.post(apiUrl)
        
        // Check if API call was successful
        if (response.data) {
          // Refresh categories from API after successful deletion
          await fetchCategories()
          
          setDeleteCategoryDialog(false)
          setCategoryToDelete(null)
          
          toast.success('Category deleted successfully', {
            position: 'top-center',
            duration: 4000,
            style: {
              background: 'white',
              color: 'black',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              maxWidth: '400px',
              fontSize: '14px',
              fontWeight: 500,
            },
          })
        } else {
          throw new Error('Failed to delete category')
        }
      } catch (error: any) {
        console.error('Error deleting category:', error)
        
        // Handle specific error cases
        let errorMessage = 'Failed to delete category'
        
        if (error.response) {
          // Server responded with error status
          errorMessage = error.response.data?.message || `Server error: ${error.response.status}`
        } else if (error.request) {
          // Request made but no response received
          errorMessage = 'Network error: No response from server'
        } else {
          // Something else happened
          errorMessage = error.message || 'Unknown error occurred'
        }
        
        toast.error(errorMessage, {
          position: 'top-center',
          duration: 4000,
          style: {
            background: 'white',
            color: 'black',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: 500,
          },
        })
      }
    }
  }

// Edit Task handlers - UPDATED with exact URL format you requested
const handleEditTask = (task: Task, columnId: string) => {
  setEditingTask(task)
  setEditingTaskColumn(columnId)
  setEditTaskDialog(true)
}

// const handleSaveTask = async () => {
//   if (editingTask && editingTaskColumn && user?.id) {
//     try {
//       // Validate required fields
//       if (!editingTask.title || !editingTask.assignee) {
//         toast.error('Please fill in all required fields', {
//           position: 'top-center',
//           duration: 4000,
//           style: {
//             background: 'white',
//             color: 'black',
//             padding: '12px 20px',
//             borderRadius: '12px',
//             boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
//             border: '1px solid rgba(0, 0, 0, 0.08)',
//             maxWidth: '400px',
//             fontSize: '14px',
//             fontWeight: 500,
//           },
//         });
//         return;
//       }

//       // Prepare form data for file upload
//       const formData = new FormData();
      
//       // Add only the file to form data (if selected)
//       if (selectedFile) {
//         formData.append('file', selectedFile);
//       }
      
     
      
//       // Encode values for URL (replace spaces and special characters)
//       const encodedTitle = encodeURIComponent(editingTask.title);
//       const encodedDescription = encodeURIComponent(editingTask.description || '');
//       const encodedAssignee = encodeURIComponent(editingTask.assignee);
      
//       // Build URL with parameters in path like your example: /UpdateBoardTask/fsdfsf/dfsfs/22/76/0/30/76/57
//       const apiUrl = `${Baseurl}/UpdateBoardTask/${encodedTitle}/${encodedDescription}/${editingTask.priorityID || ''}/${76}/0/${editingTask.categoryID || ''}/${user?.id}/${editingTask?.taskID}`;
      
//       const response = await axios.post(apiUrl, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
      
//       // Check if API call was successful
//       if (response.data) {
//         // Update local state with the updated task
//         const updatedTasks = { ...tasks };
//         const columnTasks = updatedTasks[editingTaskColumn] || [];
        
//         const updatedColumnTasks = columnTasks.map(t =>
//           t.id === editingTask.id ? {
//             ...editingTask,
//             title: editingTask.title,
//             description: editingTask.description,
//             assignee: editingTask.assignee,
//             priorityID: editingTask.priorityID,
//             categoryID: editingTask.categoryID,
//           } : t
//         );
        
//         updatedTasks[editingTaskColumn] = updatedColumnTasks;
//         setTasks(updatedTasks);
        
//         setEditTaskDialog(false);
//         setEditingTask(null);
//         setEditingTaskColumn(null);
//         setSelectedFile(null);
        
//         toast.success('Task updated successfully', {
//           position: 'top-center',
//           duration: 4000,
//           style: {
//             background: 'white',
//             color: 'black',
//             padding: '12px 20px',
//             borderRadius: '12px',
//             boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
//             border: '1px solid rgba(0, 0, 0, 0.08)',
//             maxWidth: '400px',
//             fontSize: '14px',
//             fontWeight: 500,
//           },
//         });
        
//         // Refresh data from API to ensure consistency
//         await fetchCategories();
//       } else {
//         throw new Error('Failed to update task');
//       }
//     } catch (error: any) {
//       console.error('Error updating task:', error);
      
//       let errorMessage = 'Failed to update task';
      
//       if (error.response) {
//         errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
//       } else if (error.request) {
//         errorMessage = 'Network error: No response from server';
//       } else {
//         errorMessage = error.message || 'Unknown error occurred';
//       }
      
//       toast.error(errorMessage, {
//         position: 'top-center',
//         duration: 4000,
//         style: {
//           background: 'white',
//           color: 'black',
//           padding: '12px 20px',
//           borderRadius: '12px',
//           boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
//           border: '1px solid rgba(0, 0, 0, 0.08)',
//           maxWidth: '400px',
//           fontSize: '14px',
//           fontWeight: 500,
//         },
//       });
//     }
//   }
// }
  // Delete Task Handler
  
  
  
  
  // Edit Task handlers - UPDATED with exact URL format you requested
const handleSaveTask = async () => {
  if (editingTask && editingTaskColumn && user?.id) {
    try {
      // Validate required fields
      if (!editingTask.title || !editingTask.assignee) {
        toast.error('Please fill in all required fields', {
          position: 'top-center',
          duration: 4000,
          style: {
            background: 'white',
            color: 'black',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: 500,
          },
        });
        return;
      }

      // Validate file size if a file is selected (MAX 5MB)
      if (selectedFile) {
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        
        if (selectedFile.size > maxSize) {
          toast.error('File size exceeds 5MB limit. Please choose a smaller file.', {
            position: 'top-center',
            duration: 4000,
            style: {
              background: 'white',
              color: 'black',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              maxWidth: '400px',
              fontSize: '14px',
              fontWeight: 500,
            },
          });
          return;
        }
        
        // Validate file type (optional but recommended)
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'image/jpeg',
          'image/png',
          'image/gif',
          'text/plain',
          'application/zip',
          'application/x-rar-compressed',
        ];
        
        if (!allowedTypes.includes(selectedFile.type) && !selectedFile.type.startsWith('image/')) {
          toast.error('File type not supported. Please upload PDF, Word, Excel, PowerPoint, Image, or ZIP files.', {
            position: 'top-center',
            duration: 4000,
            style: {
              background: 'white',
              color: 'black',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              maxWidth: '400px',
              fontSize: '14px',
              fontWeight: 500,
            },
          });
          return;
        }
      }

      // Prepare form data for file upload
      const formData = new FormData();
      
      // Add only the file to form data (if selected)
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      // Encode values for URL (replace spaces and special characters)
      const encodedTitle = encodeURIComponent(editingTask.title);
      const encodedDescription = encodeURIComponent(editingTask.description || '');
      const encodedAssignee = encodeURIComponent(editingTask.assignee);
      
      // Build URL with parameters in path like your example: /UpdateBoardTask/fsdfsf/dfsfs/22/76/0/30/76/57
      const apiUrl = `${Baseurl}/UpdateBoardTask/${encodedTitle}/${encodedDescription}/${editingTask.priorityID || ''}/${76}/0/${editingTask.categoryID || ''}/${user?.id}/${editingTask?.taskID}`;
      
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Check if API call was successful
      if (response.data) {
        // Update local state with the updated task
        const updatedTasks = { ...tasks };
        const columnTasks = updatedTasks[editingTaskColumn] || [];
        
        const updatedColumnTasks = columnTasks.map(t =>
          t.id === editingTask.id ? {
            ...editingTask,
            title: editingTask.title,
            description: editingTask.description,
            assignee: editingTask.assignee,
            priorityID: editingTask.priorityID,
            categoryID: editingTask.categoryID,
          } : t
        );
        
        updatedTasks[editingTaskColumn] = updatedColumnTasks;
        setTasks(updatedTasks);
        
        setEditTaskDialog(false);
        setEditingTask(null);
        setEditingTaskColumn(null);
        setSelectedFile(null);
        
        toast.success('Task updated successfully', {
          position: 'top-center',
          duration: 4000,
          style: {
            background: 'white',
            color: 'black',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: 500,
          },
        });
        
        // Refresh data from API to ensure consistency
        await fetchCategories();
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error: any) {
      console.error('Error updating task:', error);
      
      let errorMessage = 'Failed to update task';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error: No response from server';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      toast.error(errorMessage, {
        position: 'top-center',
        duration: 4000,
        style: {
          background: 'white',
          color: 'black',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: 500,
        },
      });
    }
  }
}
  
  
  
  
  
  
  const handleDeleteTask = async (taskId: string, columnId: string) => {
    try {
      // Find the task to get its projectTaskID
      const taskToDelete = tasks[columnId]?.find(t => t.id == taskId);
      
      // Call the delete API
      const apiUrl = `${Baseurl}/RemoveBoardTask?BoardTaskID=${taskId}&LoginuserID=${user?.id}`;
      
      const response = await axios.post(apiUrl);
      
      // Check if API call was successful
      if (response.data) {
        // Remove task from local state
        const updatedTasks = { ...tasks };
        updatedTasks[columnId] = updatedTasks[columnId].filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        
        toast.success('Task deleted successfully', {
          position: 'top-center',
          duration: 4000,
          style: {
            background: 'white',
            color: 'black',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: 500,
          },
        });
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error: any) {
      console.error('Error deleting task:', error);
      
      let errorMessage = 'Failed to delete task';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error: No response from server';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      toast.error(errorMessage, {
        position: 'top-center',
        duration: 4000,
        style: {
          background: 'white',
          color: 'black',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: 500,
        },
      });
    }
  };

  // View Task Handler
  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
    setTaskDetailsDialog(true)
  }

  return (
    <Box 
      sx={{ 
        width: '100%',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}
    >
      {/* Add Toaster component */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'white',
            color: 'black',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#4CAF50',
              secondary: 'white',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#f44336',
              secondary: 'white',
            },
          },
        }}
      />
      
      {/* Header */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 0,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          px: { xs: 2, sm: 3, md: 4 },
          py: 3,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            width: { xs: '100%', sm: 'auto' }
          }}>
            {isMobile && (
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                sx={{ mr: 1 }}
              >
                <Icon icon="mdi:menu" />
              </IconButton>
            )}
            <Box
              sx={{
                width: { xs: 44, sm: 48 },
                height: { xs: 44, sm: 48 },
                borderRadius: '12px',
                backgroundColor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              <Icon 
                icon="mdi:view-dashboard" 
                style={{ 
                  fontSize: '24px', 
                  color: 'white' 
                }} 
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  letterSpacing: '-0.02em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                Task Board
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 0.5,
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                Manage your team's workflow and track progress
                {error && (
                  <Typography variant="caption" color="error" display="block">
                    {error}
                  </Typography>
                )}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            width: { xs: '100%', sm: 'auto' },
            mt: { xs: 1, sm: 0 }
          }}>
           
            <Button
              variant="outlined"
              startIcon={<Icon icon="mdi:plus" width={20} />}
              onClick={handleOpenCreateCategory}
              sx={{
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                px: { xs: 2.5, sm: 3 },
                py: { xs: 1, sm: 1.2 },
                borderRadius: '10px',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                fontWeight: 600,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                width: { xs: 'auto', sm: 'auto' },
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04)
                }
              }}
            >
              Add Category
            </Button>
            <Button
              variant="contained"
              startIcon={<Icon icon="mdi:plus-circle" width={20} />}
              onClick={() => setOpenDialog(true)}
              sx={{
                backgroundColor: theme.palette.primary.main,
                px: { xs: 2.5, sm: 3 },
                py: { xs: 1, sm: 1.2 },
                borderRadius: '10px',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                fontWeight: 600,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                width: { xs: 'auto', sm: 'auto' },
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                }
              }}
            >
              New Task
            </Button>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          {/* Search input with increased width */}
          <Box sx={{ 
            position: 'relative', 
            flex: 1, 
            width: '100%',
            maxWidth: { xs: '100%', sm: '520px' }, // Increased from 420px to 520px
            minWidth: { sm: '400px' } // Added minimum width for larger screens
          }}>
            <Icon 
              icon="mdi:magnify" 
              style={{ 
                position: 'absolute', 
                left: 16, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                fontSize: '20px', 
                color: theme.palette.action.active,
                zIndex: 1 
              }}
            />
            <TextField
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  pl: 5,
                  pr: 2,
                  py: 0.5,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                    borderWidth: 2
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2
                  }
                }
              }}
            />
          </Box>
          
          {/* Filter and Task Count moved to top right corner */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            ml: 'auto' // This pushes it to the right
          }}>
            <Chip
              label={`${searchQuery || selectedPriorities.size > 0 || selectedAssignees.size > 0 || selectedCategories.size > 0 ? totalFilteredTasks : totalTasks} tasks`}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: '10px',
                height: { xs: '35px', sm: '40px' },
                px: 1.5,
                '& .MuiChip-label': {
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  px: 1
                }
              }}
            />
            
            <Button
              variant="outlined"
              startIcon={<Icon icon="mdi:filter" width={18} />}
              onClick={handleFilterClick}
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                borderRadius: '10px',
                px: { xs: 2, sm: 2.5 },
                py: { xs: 0.75, sm: 1 },
                fontWeight: 500,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                borderWidth: 2,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04)
                }
              }}
            >
              Filter
              {(selectedPriorities.size > 0 || selectedAssignees.size > 0 || selectedCategories.size > 0) && (
                <Chip
                  label="Active"
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white'
                  }}
                />
              )}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* UPDATED LINE: Added onTaskCreated prop */}
      <NewTaskDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onSubmit={handleSubmit}
        teamMembers={teamMembers}
        onTaskCreated={fetchCategories} 
          onPriorityCreated={fetchPriorities} // ADD THIS LINE
// ADDED THIS LINE
      />  

      {/* Enhanced Filter Menu - UPDATED with fixed priority filtering */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 300,
            maxWidth: 350,
            maxHeight: 500,
            overflow: 'auto',
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[3],
            p: 0
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Filter Tasks
          </Typography>
        </Box>
        
        <Box sx={{ maxHeight: 400, overflow: 'auto', p: 2 }}>
          {/* Priority Filter - FIXED VERSION */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1.5, mt: 1 }}>
            Priority
          </Typography>
          <Box sx={{ mb: 2 }}>
            {priorityLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            ) : priorities.length > 0 ? (
              priorities.map((priority) => {
                // Use the actual priority name from API
                const priorityName = priority.priorityname;
                const isSelected = selectedPriorities.has(priorityName);
                
                return (
                  <MenuItem 
                    key={priority.priorityID}
                    onClick={() => handlePriorityFilter(priorityName)}
                    sx={{
                      py: 1,
                      px: 2,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      sx={{
                        '&.Mui-checked': {
                          color: priority.colorcode
                        }
                      }}
                    />
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: priority.colorcode,
                          flexShrink: 0
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                          {priorityName}
                        </Typography>
                      }
                    />
                  </MenuItem>
                )
              })
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ px: 2, py: 1, fontStyle: 'italic' }}>
                No priorities found
              </Typography>
            )}
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Assignee Filter */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1.5, mt: 2 }}>
            Assignee
          </Typography>
          <Box sx={{ mb: 2, maxHeight: 150, overflow: 'auto' }}>
            {allAssignees.length > 0 ? (
              allAssignees.map((assignee) => (
                <MenuItem 
                  key={assignee}
                  onClick={() => handleAssigneeFilter(assignee)}
                  sx={{
                    py: 1,
                    px: 2,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)
                    }
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={selectedAssignees.has(assignee)}
                  />
                  <ListItemText 
                    primary={
                      <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                        {assignee}
                      </Typography>
                    }
                  />
                </MenuItem>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ px: 2, py: 1, fontStyle: 'italic' }}>
                No assignees found
              </Typography>
            )}
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Category Filter */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1.5, mt: 2 }}>
            Category
          </Typography>
          <Box sx={{ mb: 2, maxHeight: 150, overflow: 'auto' }}>
            {columns.map((column) => (
              <MenuItem 
                key={column.id}
                onClick={() => handleCategoryFilter(column.id)}
                sx={{
                  py: 1,
                  px: 2,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04)
                  }
                }}
              >
                <Checkbox
                  size="small"
                  checked={selectedCategories.has(column.id)}
                  sx={{
                    '&.Mui-checked': {
                      color: column.color
                    }
                  }}
                />
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: column.color,
                      flexShrink: 0
                    }}
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                      {column.title}
                    </Typography>
                  }
                />
              </MenuItem>
            ))}
          </Box>
        </Box>
        
        {/* Clear All Filters Button */}
        {(selectedPriorities.size > 0 || selectedAssignees.size > 0 || selectedCategories.size > 0) && (
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={clearAllFilters}
              startIcon={<Icon icon="mdi:close" />}
              sx={{ 
                py: 0.8,
                fontWeight: 500
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
      </Menu>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: theme.palette.text.primary }}>
            Menu
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <MenuItem sx={{ py: 1.5, borderRadius: 1, color: theme.palette.text.primary }}>
            <Icon icon="mdi:home" style={{ marginRight: 12, color: theme.palette.text.secondary }} />
            Dashboard
          </MenuItem>
          <MenuItem sx={{ py: 1.5, borderRadius: 1, color: theme.palette.text.primary }}>
            <Icon icon="mdi:calendar" style={{ marginRight: 12, color: theme.palette.text.secondary }} />
            Calendar
          </MenuItem>
          <MenuItem sx={{ py: 1.5, borderRadius: 1, color: theme.palette.text.primary }}>
            <Icon icon="mdi:chart-bar" style={{ marginRight: 12, color: theme.palette.text.secondary }} />
            Analytics
          </MenuItem>
        </Box>
      </Drawer>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading board data...</Typography>
        </Box>
      )}

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        open={taskDetailsDialog}
        onClose={() => {
          setTaskDetailsDialog(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />

      {/* Create Category Dialog */}
      <Dialog 
        open={createCategoryDialog} 
        onClose={handleCloseCreateCategoryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Create New Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={newCategoryName}
            onChange={(e) => {
              setNewCategoryName(e.target.value)
              if (categoryValidationErrors.name) {
                setCategoryValidationErrors(prev => ({ ...prev, name: '' }))
              }
            }}
            sx={{ mt: 2, mb: 1 }}
            placeholder="Enter category name (e.g., Backlog, Testing)"
            autoFocus
            error={!!categoryValidationErrors.name}
            helperText={categoryValidationErrors.name}
            disabled={categoryLoading}
            inputProps={{
              maxLength: 50
            }}
            InputProps={{
              endAdornment: (
                <Typography variant="caption" color="textSecondary">
                  {newCategoryName.length}/50
                </Typography>
              )
            }}
          />
          
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: theme.palette.text.primary }}>
            Category Color
          </Typography>
          
          {/* Compact Color Picker with Input */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: 1
          }}>
            <Box
              sx={{
                position: 'relative',
                width: 48,
                height: 48,
                borderRadius: '8px',
                backgroundColor: selectedColor,
                border: `2px solid ${categoryValidationErrors.color ? theme.palette.error.main : theme.palette.divider}`,
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: `0 2px 8px ${alpha(selectedColor, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 4px 12px ${alpha(selectedColor, 0.4)}`
                }
              }}
            >
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => {
                  setSelectedColor(e.target.value)
                  if (categoryValidationErrors.color) {
                    setCategoryValidationErrors(prev => ({ ...prev, color: '' }))
                  }
                }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
                disabled={categoryLoading}
              />
            </Box>
            
            <TextField
              fullWidth
              value={selectedColor}
              onChange={(e) => {
                setSelectedColor(e.target.value)
                if (categoryValidationErrors.color) {
                  setCategoryValidationErrors(prev => ({ ...prev, color: '' }))
                }
              }}
              placeholder="#2196F3"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.9375rem'
                }
              }}
              error={!!categoryValidationErrors.color}
              helperText={categoryValidationErrors.color}
              disabled={categoryLoading}
              inputProps={{
                pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
                title: 'Hex color format (e.g., #2196F3 or #FFF)'
              }}
            />
          </Box>
          
          {categoryValidationErrors.color && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 1,
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
              icon={<Icon icon="mdi:alert-circle" />}
            >
              {categoryValidationErrors.color}
            </Alert>
          )}
          
          {/* Color format hint */}
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
            Use hex format (e.g., #2196F3 for blue, #4CAF50 for green)
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseCreateCategoryDialog}
            disabled={categoryLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateCategory}
            disabled={categoryLoading}
            startIcon={categoryLoading && <CircularProgress size={20} /> }
          >
            {categoryLoading ? 'Creating...' : 'Create Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog 
        open={editCategoryDialog} 
        onClose={() => setEditCategoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={editingCategory?.title || ''}
            onChange={(e) => setEditingCategory(editingCategory ? {...editingCategory, title: e.target.value} : null)}
            sx={{ mt: 2, mb: 1 }}
            placeholder="Enter category name"
            autoFocus
          />
          
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: theme.palette.text.primary }}>
            Category Color
          </Typography>
          
          {/* Compact Color Picker with Input */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: 1
          }}>
            <Box
              sx={{
                position: 'relative',
                width: 48,
                height: 48,
                borderRadius: '8px',
                backgroundColor: editingCategory?.color || '#2196F3',
                border: `2px solid ${theme.palette.divider}`,
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: `0 2px 8px ${alpha(editingCategory?.color || '#2196F3', 0.3)}`,
                '&:hover': {
                  boxShadow: `0 4px 12px ${alpha(editingCategory?.color || '#2196F3', 0.4)}`
                }
              }}
            >
              <input
                type="color"
                value={editingCategory?.color || '#2196F3'}
                onChange={(e) => setEditingCategory(editingCategory ? {...editingCategory, color: e.target.value} : null)}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
            </Box>
            
            <TextField
              fullWidth
              value={editingCategory?.color || '#2196F3'}
              onChange={(e) => setEditingCategory(editingCategory ? {...editingCategory, color: e.target.value} : null)}
              placeholder="#2196F3"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.9375rem'
                }
              }}
              inputProps={{
                pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
                title: 'Hex color format (e.g., #2196F3 or #FFF)'
              }}
            />
          </Box>
          
          {/* Color format hint */}
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
            Use hex format (e.g., #2196F3 for blue, #4CAF50 for green)
          </Typography>
          
          {/* Display Category ID if available */}
          {editingCategory?.boardCategoryID && (
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
              {/* Category ID: {editingCategory.boardCategoryID} */}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditCategoryDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveCategory}
            startIcon={<Icon icon="mdi:check" />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Category Dialog */}
      <Dialog 
        open={deleteCategoryDialog} 
        onClose={() => setDeleteCategoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category "{categoryToDelete?.title}"?
            {categoryToDelete?.boardCategoryID && (
              <Typography variant="caption" display="block" color="textSecondary">
                {/* Category ID: {categoryToDelete.boardCategoryID} */}
              </Typography>
            )}
          </Typography>
          {categoryToDelete && tasks[categoryToDelete.id]?.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This category contains {tasks[categoryToDelete.id].length} task(s). 
              You must move or delete all tasks before deleting this category.
            </Alert>
          )}
          {categoryToDelete && tasks[categoryToDelete.id]?.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This category is empty and can be safely deleted.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteCategoryDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleConfirmDeleteCategory}
            disabled={categoryToDelete && tasks[categoryToDelete.id]?.length > 0}
          >
            Delete Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog - UPDATED with complete form */}
      <Dialog 
        open={editTaskDialog} 
        onClose={() => {
          setEditTaskDialog(false)
          setSelectedFile(null)
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Task Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={editingTask?.title || ''}
                onChange={(e) => setEditingTask(editingTask ? {...editingTask, title: e.target.value} : null)}
                required
              />
            </Grid>
            
            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={editingTask?.description || ''}
                onChange={(e) => setEditingTask(editingTask ? {...editingTask, description: e.target.value} : null)}
              />
            </Grid>
            
            {/* Priority */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editingTask?.priorityID || ''}
                  label="Priority"
                  onChange={(e) => setEditingTask(editingTask ? {...editingTask, priorityID: Number(e.target.value)} : null)}
                >
                  {priorities.map(priority => (
                    <MenuItem key={priority.priorityID} value={priority.priorityID}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%',
                          backgroundColor: priority.colorcode 
                        }} />
                        {priority.priorityname}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Assignee */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select
                  value={editingTask?.assignee || ''}
                  label="Assignee"
                  onChange={(e) => setEditingTask(editingTask ? {...editingTask, assignee: e.target.value} : null)}
                >
                  {teamMembers.map(member => (
                    <MenuItem key={member} value={member}>{member}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Category */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editingTask?.categoryID || ''}
                  label="Category"
                  onChange={(e) => {
                    const categoryID = Number(e.target.value);
                    const category = columns.find(col => col.boardCategoryID === categoryID);
                    setEditingTask(editingTask ? {
                      ...editingTask, 
                      categoryID: categoryID,
                      categoryName: category?.title || ''
                    } : null);
                  }}
                >
                  {columns.map(column => (
                    <MenuItem key={column.boardCategoryID} value={column.boardCategoryID}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%',
                          backgroundColor: column.color 
                        }} />
                        {column.title}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* File Upload */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Attachment
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Icon icon="mdi:paperclip" />}
                  sx={{ mb: 1 }}
                >
                  Upload File
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </Button>
                {selectedFile && (
                  <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                    {selectedFile.name}
                  </Typography>
                )}
                {editingTask?.attachmentLink && !selectedFile && (
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 2, display: 'inline' }}>
                    Current file: {editingTask.attachmentLink.split('/').pop()}
                  </Typography>
                )}
              </Box>
            </Grid>
            
            {/* Current Status */}
         
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => {
            setEditTaskDialog(false)
            setSelectedFile(null)
          }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveTask}
            disabled={!editingTask?.title || !editingTask?.assignee}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Board */}
      {!loading && (
        <Box 
          sx={{ 
            overflowX: 'auto',
            height: { xs: 'auto', sm: 'calc(100vh - 180px)' },
            minHeight: { xs: 'calc(100vh - 220px)', sm: 'auto' },
            backgroundColor: theme.palette.background.default,
            '&::-webkit-scrollbar': {
              height: '8px'
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.action.hover,
              borderRadius: '4px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.action.disabled,
              borderRadius: '4px',
              '&:hover': {
                background: theme.palette.action.active
              }
            }
          }}
        >
          <Box 
            sx={{ 
              display: 'flex',
              gap: { xs: 2, sm: 3 },
              p: { xs: 2, sm: 3, md: 4 },
              height: '100%',
              minWidth: 'fit-content',
              flexDirection: { xs: 'column', lg: 'row' },
              [theme.breakpoints.down('lg')]: {
                flexDirection: 'row',
                flexWrap: 'wrap'
              },
              [theme.breakpoints.down('sm')]: {
                flexDirection: 'column'
              }
            }}
          >
            {columnsWithFilteredTasks.length === 0 && !loading ? (
              <Box sx={{ textAlign: 'center', width: '100%', py: 8 }}>
                <Typography variant="h6" color="textSecondary">
                  No categories found. Create your first category!
                </Typography>
              </Box>
            ) : (
              columnsWithFilteredTasks.map((column) => (
                <Box
                  key={column.id}
                  sx={{
                    minWidth: { xs: '100%', sm: '280px', md: '300px', lg: '320px' },
                    maxWidth: { xs: '100%', sm: '280px', md: '300px', lg: '320px' },
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    [theme.breakpoints.down('lg')]: {
                      minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(50% - 16px)' },
                      maxWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(50% - 16px)' }
                    },
                    [theme.breakpoints.down('sm')]: {
                      minWidth: '100%',
                      maxWidth: '100%'
                    }
                  }}
                >
                  {/* Compact Column Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                      p: 2,
                      borderRadius: '10px',
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.1 : 0.05)}`
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      flex: 1, 
                      minWidth: 0,
                      mr: 1
                    }}>
                      {/* Compact Icon */}
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '8px',
                          backgroundColor: column.iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Icon 
                          icon={column.icon} 
                          style={{ 
                            fontSize: '18px', 
                            color: 'white' 
                          }} 
                        />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography 
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            fontSize: '0.9375rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {column.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontWeight: 500,
                              fontSize: '0.75rem'
                            }}
                          >
                            {searchQuery || selectedPriorities.size > 0 || selectedAssignees.size > 0 || selectedCategories.size > 0 ? (
                              <>
                                {column.count} of {tasks[column.id]?.length || 0} tasks
                              </>
                            ) : (
                              <>
                                {column.count} tasks
                              </>
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      flexShrink: 0
                    }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditCategory(column)}
                        sx={{
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            backgroundColor: alpha(column.iconColor, 0.1),
                            color: column.iconColor
                          },
                          width: 32,
                          height: 32
                        }}
                      >
                        <Icon icon="mdi:pencil" width={16} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCategory(column)}
                        sx={{
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            color: theme.palette.error.main
                          },
                          width: 32,
                          height: 32
                        }}
                      >
                        <Icon icon="mdi:delete" width={16} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Task Column with filtered tasks */}
                  <TaskColumn
                    title={column.title}
                    tasks={column.filteredTasks}
                    columnId={column.id}
                    onDrop={handleDrop}
                    color={column.color}
                    isMobile={isMobile}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onViewTask={handleViewTask}
                  />
                </Box>
              ))
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default YourFeaturePage
