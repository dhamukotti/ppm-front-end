// ** React Imports
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth'
// ** MUI Components
import {
  CircularProgress,
  Dialog,
  Divider,
  FormControl,
  IconButton,
  Typography,
  Zoom,
  TextField,
  Select,
  MenuItem,
  Chip,
  Popover,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

// ** Icons Imports
import { Icon } from '@iconify/react';

// ** React Colorful Import
import { HexColorPicker } from 'react-colorful';

// ** Axios Import
import axios from 'axios';

// ** React Hot Toast Import
import { toast } from 'react-hot-toast';

export interface NewTaskData {
  title: string;
  description: string;
  priority: string;
  assignee: string;
  dueDate: string;
  tags: string[];
  category: string;
    projectTask: string;  // Added category field
}

interface TeamMember {
  value: string;
  label: string;
  id?: string;
}

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: NewTaskData) => void;
  teamMembers: TeamMember[];
  onTaskCreated?: () => void; 
  onPriorityCreated?: () => void;// ADDED THIS LINE
}
interface ProjectTask {
  taskID: number;
  taskname: string;
}
// Define Priority type
interface Priority {
  id: string;
  name: string;
  colorCode: string;
}


// Define Category type
interface Category {
  boardCategoryID: string;
  categoryname: string;
  colorCode: string;
}

const Baseurl = process.env.NEXT_PUBLIC_API_URL1

export function NewTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  teamMembers,
  onTaskCreated,   onPriorityCreated,// ADDED THIS LINE
}: NewTaskDialogProps) {
  const [formData, setFormData] = useState<NewTaskData>({
    title: '',
    description: '',
    priority: '',
    assignee: '',
    dueDate: '',
    tags: [],
    category: '',
      projectTask: '',  // Initialize category
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    priority?: string;
    assignee?: string;
    category?: string;
  }>({});
  const { user } = useAuth()
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  // Priority states
  const [priorityAnchorEl, setPriorityAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tempPriorityName, setTempPriorityName] = useState<string>('');
  const [tempColor, setTempColor] = useState<string>('#FF9800');
  const [isCreatingPriority, setIsCreatingPriority] = useState<boolean>(false);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // File upload states - CHANGED: Now single file/image
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Edit/Delete states
  const [contextMenuAnchorEl, setContextMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
  const [isEditingPriority, setIsEditingPriority] = useState<boolean>(false);
  const [editingPriority, setEditingPriority] = useState<Priority | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [isDeletingPriority, setIsDeletingPriority] = useState<boolean>(false);
  
  // Fetch priorities and categories when dialog opens
  useEffect(() => {
    if (open) {
      fetchPriorities();
      fetchCategories();
      fetchProjectTasks()
    }
  }, [open]);

  // Fetch project tasks from API
const fetchProjectTasks = async () => {
  try {
    const response = await axios.get(`${Baseurl}/GetProjectTaskList?LoginuserID=${user?.id}`);
    
    if (response.data && Array.isArray(response.data)) {
      const formattedTasks = response.data.map((item: any) => ({
        taskID: item.taskID || 0,
        taskname: item.taskname || 'Unnamed Task'
      }));
      
      setProjectTasks(formattedTasks);
    }
  } catch (error: any) {
    console.error('Error fetching project tasks:', error);
    toast.error('Failed to load project tasks from API', {
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
  // Fetch priorities from API
  const fetchPriorities = async () => {
    try {
      const apiUrl = `${Baseurl}/GetBoardPriorityList?LoginuserID=${user?.id}`;
      const response = await axios.get(apiUrl);

      if (response.status === 200) {
        let prioritiesData = response.data;
        
        if (prioritiesData && typeof prioritiesData === 'object' && !Array.isArray(prioritiesData)) {
          if (prioritiesData.data && Array.isArray(prioritiesData.data)) {
            prioritiesData = prioritiesData.data;
          }
          else if (prioritiesData.response && Array.isArray(prioritiesData.response)) {
            prioritiesData = prioritiesData.response;
          }
          else if (prioritiesData.result && Array.isArray(prioritiesData.result)) {
            prioritiesData = prioritiesData.result;
          }
          else if (prioritiesData.priorities && Array.isArray(prioritiesData.priorities)) {
            prioritiesData = prioritiesData.priorities;
          }
        }

        if (Array.isArray(prioritiesData) && prioritiesData.length > 0) {
          const apiPriorities = prioritiesData.map((item: any) => {
            let priorityId = '';
            if (item.priorityID !== undefined && item.priorityID !== null) {
              priorityId = item.priorityID.toString();
            } else if (item.PriorityID !== undefined && item.PriorityID !== null) {
              priorityId = item.PriorityID.toString();
            } else if (item.id !== undefined && item.id !== null) {
              priorityId = item.id.toString();
            } else if (item.ID !== undefined && item.ID !== null) {
              priorityId = item.ID.toString();
            } else {
              const name = item.priorityname || item.priorityName || item.name || item.PriorityName || 'Unknown';
              priorityId = name.toLowerCase().replace(/\s+/g, '_');
            }

            const priorityName = item.priorityname || 
                               item.priorityName || 
                               item.name || 
                               item.PriorityName || 
                               'Unknown Priority';

            const colorCode = item.colorcode || 
                             item.colorCode || 
                             item.ColorCode || 
                             '#FF9800';

            return {
              id: priorityId,
              name: priorityName,
              colorCode: colorCode
            };
          });

          setPriorities(apiPriorities);

          // Set default priority to first one if exists and formData.priority is empty
          if (apiPriorities.length > 0 && !formData.priority) {
            setFormData(prev => ({
              ...prev,
              priority: apiPriorities[0].id
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching priorities:', error);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${Baseurl}/GetBoardList?LoginuserID=${user?.id}`)
      
      if (response.data && Array.isArray(response.data)) {
        const formattedCategories = response.data.map((item: any) => ({
          boardCategoryID: item.boardCategoryID?.toString() || '',
          categoryname: item.categoryname || 'Unnamed Category',
          colorCode: item.colorCode || '#FF9800'
        }));
        
        setCategories(formattedCategories);
        
        // Set default category to first one if exists and formData.category is empty
        if (formattedCategories.length > 0 && !formData.category) {
          setFormData(prev => ({
            ...prev,
            category: formattedCategories[0].boardCategoryID
          }));
        }
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
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
      });
    }
  };

  // Handle file selection - UPDATED: Single file/image with 5MB limit
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 5MB limit', {
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

    // Check if it's an image or document
    if (file.type.startsWith('image/')) {
      setSelectedImage(file);
      setSelectedFile(null); // Remove document if image is selected
    } else {
      setSelectedFile(file);
      setSelectedImage(null); // Remove image if document is selected
    }
  };

  // Remove file from selection
  const removeFile = (isImage: boolean) => {
    if (isImage) {
      setSelectedImage(null);
    } else {
      setSelectedFile(null);
    }
  };

  // Handle priority icon click
  const handlePriorityIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setTempPriorityName('');
    setTempColor('#FF9800');
    setIsEditingPriority(false);
    setEditingPriority(null);
    setPriorityAnchorEl(event.currentTarget);
  };

  // Handle priority popup close
  const handlePriorityPopupClose = () => {
    setPriorityAnchorEl(null);
    setIsEditingPriority(false);
    setEditingPriority(null);
    setTempPriorityName('');
    setTempColor('#FF9800');
  };

  // Handle priority save
  const handlePrioritySave = async () => {
    if (!tempPriorityName.trim()) {
      toast.error('Please enter a priority name');
      return;
    }

    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(tempColor)) {
      toast.error('Please enter a valid hex color code (e.g., #FFFFFF)');
      return;
    }

    if (isEditingPriority && editingPriority) {
      await updatePriority();
    } else {
      await createPriority();
    }
      if (onPriorityCreated) {
    onPriorityCreated();
  }
  };

  // Create new priority
  const createPriority = async () => {
    setIsCreatingPriority(true);
    
    try {
      const apiUrl = `${Baseurl}/CreateBoardPriority`;
      
      const params = {
        Priorityname: tempPriorityName.trim(),
        ColorCode: tempColor,
        LoginuserID: user?.id
      };

      const response = await axios.post(apiUrl, null, { params });

      if (response.status === 200) {
        toast.success('Priority created successfully!');
        fetchPriorities();
        handlePriorityPopupClose();
      }
      if (onPriorityCreated) {
        onPriorityCreated();
      }
    } catch (error) {
      console.error('Error creating priority:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          toast.error(`Error: ${error.response.status} - ${error.response.data?.message || 'Failed to create priority'}`);
        }
      }
    } finally {
      setIsCreatingPriority(false);
    }
  };

  // Update existing priority
  const updatePriority = async () => {
    if (!editingPriority) return;
    
    setIsCreatingPriority(true);
    
    try {
      const apiUrl = `${Baseurl}/UpdateBoardPriority`;
      
      const params = {
        Name: tempPriorityName.trim(),
        ColorCode: tempColor,
        PriorityID: editingPriority.id,
        LoginuserID: user?.id
      };

      const response = await axios.post(apiUrl, null, { params });

      if (response.status === 200) {
        toast.success('Priority updated successfully!');
        fetchPriorities();
        handlePriorityPopupClose();
      }
      if (onPriorityCreated) {
        onPriorityCreated();
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          toast.error(`Error: ${error.response.status} - ${error.response.data?.message || 'Failed to update priority'}`);
        }
      }
    } finally {
      setIsCreatingPriority(false);
    }
  };

  // Delete priority
  const deletePriority = async () => {
    if (!selectedPriority) return;
    
    setIsDeletingPriority(true);
    
    try {
      const apiUrl = `${Baseurl}/RemoveBoardPriority`;
      
      const params = {
        LoginuserID: user?.id,
        PriorityID: selectedPriority.id
      };

      const response = await axios.post(apiUrl, null, { params });

      if (response.status === 200) {
        toast.success('Priority deleted successfully!');
        fetchPriorities();
        
        if (formData.priority === selectedPriority.id && priorities.length > 0) {
          const firstPriority = priorities.find(p => p.id !== selectedPriority.id);
          if (firstPriority) {
            setFormData(prev => ({
              ...prev,
              priority: firstPriority.id
            }));
          }
        }
      }
        if (onPriorityCreated) {
        onPriorityCreated();
      }
    } catch (error) {
      console.error('Error deleting priority:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          toast.error(`Error: ${error.response.status} - ${error.response.data?.message || 'Failed to delete priority'}`);
        }
      }
    } finally {
      setIsDeletingPriority(false);
      setDeleteDialogOpen(false);
      setSelectedPriority(null);
      setContextMenuAnchorEl(null);
    }
  };

  // Handle context menu open
  const handleContextMenuOpen = (event: React.MouseEvent<HTMLElement>, priority: Priority) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenuAnchorEl(event.currentTarget);
    setSelectedPriority(priority);
  };

  // Handle context menu close
  const handleContextMenuClose = () => {
    setContextMenuAnchorEl(null);
    setSelectedPriority(null);
  };

  // Handle edit priority
  const handleEditPriority = () => {
    if (!selectedPriority) return;
    
    setEditingPriority(selectedPriority);
    setTempPriorityName(selectedPriority.name);
    setTempColor(selectedPriority.colorCode);
    setIsEditingPriority(true);
    
    setPriorityAnchorEl(document.querySelector('#priority-button') as HTMLButtonElement);
    handleContextMenuClose();
  };

  // Handle delete priority click
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setContextMenuAnchorEl(null);
  };

  // Close delete dialog
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedPriority(null);
  };

  // Get priority color for display
  const getPriorityColor = (priorityId: string) => {
    const priority = priorities.find(p => p.id === priorityId);
    return priority ? priority.colorCode : '#FF9800';
  };

  // Get priority name for display
  const getPriorityName = (priorityId: string) => {
    const priority = priorities.find(p => p.id === priorityId);
    return priority && priority.name ;
  };

  // Get category name for display
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.boardCategoryID === categoryId);
    return category ? category.categoryname : 'Select Category';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields except file upload
    const newErrors: {
      title?: string;
      description?: string;
      priority?: string;
      assignee?: string;
      category?: string;
    } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a task title';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a task description';
    }
    if (!formData.priority) {
      newErrors.priority = 'Please select a priority';
    }
    if (!formData.assignee) {
      newErrors.assignee = 'Please select an assignee';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setIsUploading(true);
    
    try {
      // Get the selected priority
      const selectedPriority = priorities.find(p => p.id === formData.priority);
      const priorityID = selectedPriority?.id;

      // Get the selected category
      const categoryID = formData.category || '';
      const userid = formData.assignee ||''
      // NOTE: You need to get these IDs from your context/props
   
const projectTaskID = formData.projectTask || '';
      // Encode the title and description for URL
      const encodedTitle = encodeURIComponent(formData.title);
      const encodedDescription = encodeURIComponent(formData.description || '');

      // Construct the API URL according to the curl example
      const apiUrl = `${Baseurl}/CreateBoardTask/${encodedTitle}/${encodedDescription}/${priorityID}/${userid}/${projectTaskID}/${categoryID}/${user?.id}`;

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add file to FormData (only one file) - OPTIONAL
      const fileToUpload = selectedImage || selectedFile;
      if (fileToUpload) {
        formDataToSend.append('file', fileToUpload);
      }

      const response = await axios.post(apiUrl, formDataToSend, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
            
            // Show upload status toast
            if (progress < 100) {
              toast.loading(`Uploading: ${progress}%`, {
                id: 'upload-progress',
                position: 'top-center',
                duration: Infinity,
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
              toast.success('Upload complete!', {
                id: 'upload-progress',
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
          }
        },
      });

      if (response.status === 200 || response.status === 201) {
        // Call the original onSubmit callback with form data
        await onSubmit(formData);
        
        // ADDED THIS SECTION: Call the onTaskCreated callback if provided
        if (onTaskCreated) {
          onTaskCreated();
        }
        
        // Reset form and files
        setFormData({
          title: '',
          description: '',
          priority: priorities.length > 0 ? priorities[0].id : '',
          assignee: '',
          dueDate: '',
          tags: [],
          category: categories.length > 0 ? categories[0].boardCategoryID : '',
            projectTask: '', // Add this
        });
        setTagInput('');
        setSelectedFile(null);
        setSelectedImage(null);
        setUploadProgress(0);
        setErrors({});
        onOpenChange(false);
        
        toast.success('Task created successfully!');
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Show error message
      if (axios.isAxiosError(error)) {
        if (error.response) {
          toast.error(`Error: ${error.response.status} - ${error.response.data?.message || 'Failed to create task'}`);
        } else {
          toast.error('Network error. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      
      // Still call onSubmit to let parent handle the error if needed
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      // Dismiss any remaining upload toast
      toast.dismiss('upload-progress');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onCloseModal = () => {
    // setFormData({
    //   title: '',
    //   description: '',
    //   priority: priorities.length > 0 ? priorities[0].id : '',
    //   assignee: '',
    //   dueDate: '',
    //   tags: [],
    //   category: categories.length > 0 ? categories[0].boardCategoryID : '',
    // });
    setFormData({
  title: '',
  description: '',
  priority: priorities.length > 0 ? priorities[0].id : '',
  assignee: '',
  dueDate: '',
  tags: [],
  category: categories.length > 0 ? categories[0].boardCategoryID : '',
  projectTask: '', // or null, {}, [], depending on its type
});
    setTagInput('');
    setSelectedFile(null);
    setSelectedImage(null);
    setUploadProgress(0);
    setErrors({});
    setPriorityAnchorEl(null);
    onOpenChange(false);
    setIsUploading(false);
    // Dismiss any upload toast
    toast.dismiss('upload-progress');
  };

  const priorityOpen = Boolean(priorityAnchorEl);
  const priorityPopupId = priorityOpen ? 'priority-popup' : undefined;
  const contextMenuOpen = Boolean(contextMenuAnchorEl);

  return (
    <>
      {/* MAIN DIALOG */}
      <Dialog
        open={open}
        style={{
          padding: 0,
        }}
        onClose={onCloseModal}
        TransitionComponent={Zoom}
        fullWidth
        maxWidth="lg"
      >
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingX: 5,
            paddingY: 2,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '18px' }}>
            Create New Task
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onCloseModal}
            style={{
              height: 35,
              width: 35,
              border: '1px solid ',
              borderRadius: 4,
            }}
          >
            <Icon icon="mdi:close" fontSize={24} />
          </IconButton>
        </Box>
        <Divider />

        <Box py={2}>
          <form noValidate autoComplete="off" onSubmit={handleSubmit}>
            {/* Task Title */}
            <FormControl
              fullWidth
              sx={{
                paddingX: 5,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '12px', marginBottom: 3 }}>
                Task Title <span style={{ color: 'red' }}>*</span>
              </Typography>

              <TextField
                autoFocus
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) {
                    setErrors({ ...errors, title: undefined });
                  }
                }}
                error={Boolean(errors?.title)}
                helperText={Boolean(errors?.title) && errors?.title}
                fullWidth
                id="TaskTitle"
                placeholder="Enter task title"
                sx={{ marginBottom: 4 }}
              />
            </FormControl>

            {/* Description */}
            <FormControl
              fullWidth
              sx={{
                paddingX: 5,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '12px', marginBottom: 3 }}>
                Description <span style={{ color: 'red' }}>*</span>
              </Typography>

              <TextField
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) {
                    setErrors({ ...errors, description: undefined });
                  }
                }}
                error={Boolean(errors?.description)}
                helperText={Boolean(errors?.description) && errors?.description}
                multiline
                rows={3}
                fullWidth
                id="TaskDescription"
                placeholder="Describe the task..."
                sx={{ marginBottom: 4 }}
              />
            </FormControl>

            {/* Priority, Category and Assignee Row */}
            <Box
              sx={{
                display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr', // Changed from 1fr 1fr 1fr
                gap: 2,
                paddingX: 5,
                marginBottom: 4,
              }}
            >
              {/* Priority */}
              <FormControl fullWidth>
                <Typography sx={{ fontWeight: 700, fontSize: '12px', marginBottom: 1 }}>
                  Priority <span style={{ color: 'red' }}>*</span>
                  <IconButton
                    id="priority-button"
                    size="small"
                    onClick={handlePriorityIconClick}
                    sx={{
                      padding: 0,
                      marginLeft: 1,
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    <Icon icon="mdi:plus-circle" fontSize={16} />
                  </IconButton>
                </Typography>
                <Select
                  value={formData.priority || ""}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      priority: e.target.value,
                    });
                    if (errors.priority) {
                      setErrors({ ...errors, priority: undefined });
                    }
                  }}
                  error={Boolean(errors?.priority)}
                  fullWidth
                  renderValue={(selected) => {
                    if (!selected) {
                      return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Select Priority</span>;
                    }
                    
                    // Find the selected priority from the priorities array
                    const selectedPriority = priorities.find(p => p.id === selected);
                    
                    // If priority is found, show the color and name
                    if (selectedPriority) {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: selectedPriority.colorCode,
                            }}
                          />
                          <span>{selectedPriority.name}</span>
                        </Box>
                      );
                    }
                    
                    // Fallback: show the selected value if priority not found
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: '#FF9800', // Default color
                          }}
                        />
                        <span>{selected}</span>
                      </Box>
                    );
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Priority
                  </MenuItem>
                  {priorities.map((priority) => (
                    <MenuItem 
                      key={priority.id} 
                      value={priority.id}
                      onContextMenu={(e) => handleContextMenuOpen(e, priority)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: priority.colorCode,
                          }}
                        />
                        <span>{priority.name}</span>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleContextMenuOpen(e, priority)}
                        sx={{
                          padding: '4px',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.08)',
                          },
                        }}
                      >
                        <Icon icon="mdi:dots-vertical" fontSize={16} />
                      </IconButton>
                    </MenuItem>
                  ))}
                </Select>
                {Boolean(errors?.priority) && (
                  <Typography
                    sx={{
                      color: 'error.main',
                      fontSize: '0.75rem',
                      marginTop: '3px',
                      marginLeft: '14px',
                    }}
                  >
                    {errors?.priority}
                  </Typography>
                )}
              </FormControl>
              {/* Category Dropdown */}
              <FormControl fullWidth>
                <Typography sx={{ fontWeight: 700, fontSize: '12px', marginBottom: 1 }}>
                  Category <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Select
                  value={formData.category || ""}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      category: e.target.value,
                    });
                    if (errors.category) {
                      setErrors({ ...errors, category: undefined });
                    }
                  }}
                  error={Boolean(errors?.category)}
                  fullWidth
                  renderValue={(selected) => {
                    if (!selected) {
                      return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Select Category</span>;
                    }
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selected && (
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: categories.find(c => c.boardCategoryID === selected)?.colorCode || '#FF9800',
                            }}
                          />
                        )}
                        <span>{getCategoryName(selected)}</span>
                      </Box>
                    );
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Category
                  </MenuItem>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <MenuItem 
                        key={category.boardCategoryID} 
                        value={category.boardCategoryID}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: category.colorCode,
                            }}
                          />
                          <span>{category.categoryname}</span>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem key="no-categories" value="" disabled>
                      No categories available
                    </MenuItem>
                  )}
                </Select>
                {Boolean(errors?.category) && (
                  <Typography
                    sx={{
                      color: 'error.main',
                      fontSize: '0.75rem',
                      marginTop: '3px',
                      marginLeft: '14px',
                    }}
                  >
                    {errors?.category}
                  </Typography>
                )}
              </FormControl>
              {/* Project Tasks Dropdown - NEW */}
              <FormControl fullWidth>
                <Typography sx={{ fontWeight: 700, fontSize: '12px', marginBottom: 1 }}>
                  Project Task
                </Typography>
                <Select
                  value={formData.projectTask || ''}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      projectTask: e.target.value,
                    });
                  }}
                  fullWidth
                  renderValue={(selected) => {
                    if (!selected) {
                      return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Select Project Task</span>;
                    }
                    const task = projectTasks.find(t => t.taskID.toString() === selected);
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{task?.taskname || selected}</span>
                      </Box>
                    );
                  }}
                >
                  <MenuItem key="none" value="">
                    <em>None</em>
                  </MenuItem>
                  {projectTasks.length > 0 ? (
                    projectTasks.map((task) => (
                      <MenuItem 
                        key={task.taskID} 
                        value={task.taskID.toString()}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <span>{task.taskname}</span>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem key="no-tasks" value="" disabled>
                      No project tasks available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              {/* Assignee */}
              <FormControl fullWidth>
                <Typography sx={{ fontWeight: 700, fontSize: '12px', marginBottom: 1 }}>
                  Assign To <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Select
                key={1}
                  value={formData.assignee || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, assignee: e.target.value });
                    if (errors.assignee) {
                      setErrors({ ...errors, assignee: undefined });
                    }
                  }}
                  fullWidth
                  displayEmpty
                  error={Boolean(errors?.assignee)}
                >
                  <MenuItem value="" disabled>
                    Select member
                  </MenuItem>
                  {/* {teamMembers.map((member) => (
                    <MenuItem key={member} value={member}>
                      {member}
                    </MenuItem>
                  ))} */}
                  {teamMembers.map((member: TeamMember, index: number) => (
                    <MenuItem key={member?.value || member?.id || index} value={member?.value}>
                      {member?.label}
                    </MenuItem>
                  ))}
                </Select>
                {Boolean(errors?.assignee) && (
                  <Typography
                    sx={{
                      color: 'error.main',
                      fontSize: '0.75rem',
                      marginTop: '3px',
                      marginLeft: '14px',
                    }}
                  >
                    {errors?.assignee}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* File Upload Section - OPTIONAL */}
            <FormControl
              fullWidth
              sx={{
                paddingX: 5,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '12px', marginBottom: 1 }}>
                Attach File or Image (Optional)
              </Typography>
              
              {/* File Input */}
              <Box sx={{ marginBottom: 2 }}>
                <input
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Icon icon="mdi:paperclip" />}
                    sx={{
                      borderRadius: 30,
                      textTransform: 'capitalize',
                      fontWeight: 400,
                      fontSize: '14px',
                    }}
                  >
                    Choose File
                  </Button>
                </label>
                <Typography variant="caption" sx={{ marginLeft: 2, color: 'text.secondary' }}>
                  Max 1 file, 5MB size (Optional)
                </Typography>
              </Box>

              {/* Upload Progress */}
              {isUploading && (
                <Box sx={{ marginBottom: 2 }}>
                  <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5 }}>
                    Uploading: {uploadProgress}%
                  </Typography>
                  <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1 }}>
                    <Box
                      sx={{
                        width: `${uploadProgress}%`,
                        height: 8,
                        bgcolor: 'primary.main',
                        borderRadius: 1,
                        transition: 'width 0.3s',
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Selected Image Preview */}
              {selectedImage && (
                <Box key="image-preview" sx={{ marginBottom: 2 }}>
                  <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>
                    Image Preview
                  </Typography>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: 200,
                      height: 150,
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt={selectedImage.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeFile(true)}
                      sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        padding: 0.5,
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)',
                        },
                      }}
                    >
                      <Icon icon="mdi:close" fontSize={12} />
                    </IconButton>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        padding: '4px 8px',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                        {selectedImage.name} ({(selectedImage.size / 1024).toFixed(1)} KB)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Selected File Info */}
              {selectedFile && !selectedImage && (
                <Box key="file-preview" sx={{ marginBottom: 2 }}>
                  <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>
                    Selected File
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 2,
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      backgroundColor: 'grey.50',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Icon icon="mdi:file-document-outline" fontSize={24} color='black' />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 ,color:'black'}}>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'black' }}>
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => removeFile(false)}
                      sx={{ padding: 0.5 }}
                    >
                      <Icon icon="mdi:close" fontSize={16} color='red' />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* No file selected message */}
              {!selectedFile && !selectedImage && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  No file selected. Choose an image or document to attach (Optional).
                </Typography>
              )}
            </FormControl>

            {/* Tags (Optional - Keep your existing tags section) */}
            {/* <FormControl
              fullWidth
              sx={{
                paddingX: 5,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '12px', marginBottom: 1 }}>
                Tags
              </Typography>

              <Box sx={{ display: 'flex', gap: 3, marginBottom: 2 }}>
                <TextField
                  placeholder="Add a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  onClick={addTag}
                  sx={{
                    minWidth: 80,
                    borderRadius: 30,
                    textTransform: 'capitalize',
                    fontWeight: 400,
                    fontSize: '14px',
                  }}
                >
                  Add
                </Button>
              </Box>
              {formData.tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      deleteIcon={<Icon icon="mdi:close" />}
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </FormControl> */}

            <Divider sx={{ marginTop: 4 }} />

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 2,
                px: 5,
              }}
            >
              <Button
                sx={{
                  borderRadius: 30,
                  fontWeight: 400,
                  fontSize: '14px',
                  textTransform: 'capitalize',
                }}
                variant="outlined"
                size="small"
                onClick={onCloseModal}
              >
                Cancel
              </Button>

              <Button
                sx={{
                  borderRadius: 30,
                  fontWeight: 400,
                  fontSize: '14px',
                  textTransform: 'capitalize',
                }}
                variant="contained"
                size="large"
                type="submit"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting || isUploading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={15} color="inherit" />
                    <span>{uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Creating...'}</span>
                  </Box>
                ) : (
                  'Create Task'
                )}
              </Button>
            </Box>
          </form>
        </Box>
      </Dialog>

      {/* PRIORITY POPUP */}
      <Popover
        id={priorityPopupId}
        open={priorityOpen}
        anchorEl={priorityAnchorEl}
        onClose={handlePriorityPopupClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            padding: 3,
            minWidth: 280,
          },
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '14px', marginBottom: 2 }}>
          {isEditingPriority ? 'Edit Priority' : 'Create New Priority'}
        </Typography>
        
        <Box sx={{ marginBottom: 3 }}>
          <Typography sx={{ fontSize: '12px', marginBottom: 1, color: 'text.secondary' }}>
            Priority Name
          </Typography>
          <TextField
            value={tempPriorityName}
            onChange={(e) => setTempPriorityName(e.target.value)}
            fullWidth
            size="small"
            placeholder="Enter priority name"
            disabled={isCreatingPriority}
          />
        </Box>
        
        <Box sx={{ marginBottom: 3 }}>
          <Typography sx={{ fontSize: '12px', marginBottom: 1, color: 'text.secondary' }}>
            Color
          </Typography>
          
          <Box sx={{ marginBottom: 2 }}>
            <HexColorPicker
              color={tempColor}
              onChange={setTempColor}
              style={{ width: '100%' }}
              //disabled={isCreatingPriority}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '4px',
                backgroundColor: tempColor,
                border: '1px solid #ccc',
              }}
            />
            <TextField
              value={tempColor}
              onChange={(e) => setTempColor(e.target.value)}
              size="small"
              placeholder="#RRGGBB"
              sx={{ flexGrow: 1 }}
              disabled={isCreatingPriority}
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, marginTop: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handlePriorityPopupClose}
            disabled={isCreatingPriority}
            sx={{ textTransform: 'capitalize' }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handlePrioritySave}
            disabled={!tempPriorityName.trim() || isCreatingPriority}
            sx={{ textTransform: 'capitalize' }}
          >
            {isCreatingPriority ? (
              <CircularProgress size={20} color="inherit" />
            ) : isEditingPriority ? (
              'Update'
            ) : (
              'Save'
            )}
          </Button>
        </Box>
      </Popover>

      {/* CONTEXT MENU */}
      <Popover
        open={contextMenuOpen}
        anchorEl={contextMenuAnchorEl}
        onClose={handleContextMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ padding: 1 }}>
          <MenuItem onClick={handleEditPriority} key="edit-priority">
            <Icon icon="mdi:pencil" fontSize={16} style={{ marginRight: 8 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} key="delete-priority">
            <Icon icon="mdi:delete" fontSize={16} style={{ marginRight: 8 }} />
            Delete
          </MenuItem>
        </Box>
      </Popover>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Priority
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the priority "{selectedPriority?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} disabled={isDeletingPriority} key="cancel-delete">
            Cancel
          </Button>
          <Button 
            onClick={deletePriority} 
            variant="contained" 
            color="error"
            disabled={isDeletingPriority}
            startIcon={isDeletingPriority ? <CircularProgress size={16} color="inherit" /> : null}
            key="confirm-delete"
          >
            {isDeletingPriority ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
