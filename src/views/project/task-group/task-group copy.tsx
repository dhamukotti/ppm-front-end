// import type { SyntheticEvent } from 'react'
// import { useEffect, useMemo, useState } from 'react'

// import { Icon } from '@iconify/react'
// import { Grid2, Typography } from '@mui/material'
// import type { AccordionProps } from '@mui/material/Accordion'
// import MuiAccordion from '@mui/material/Accordion'
// import MuiAccordionDetails from '@mui/material/AccordionDetails'
// import type { AccordionSummaryProps } from '@mui/material/AccordionSummary'
// import MuiAccordionSummary from '@mui/material/AccordionSummary'
// import { styled } from '@mui/material/styles'
// import { fetchTaskGroupList, } from '@/services/modules/task-group'

// import { useQuery } from '@tanstack/react-query'

// import { useProject } from '@/context/project-context'
// import { fetchTaskList } from '@/services/modules/task'
// import type { TaskGroup } from '@/services/modules/task-group/types'
// import TaskGroupActions from './actions'
// import DeleteTasksComponent from './task/delete-tasks'
// import TaskTable from './task/task-table'
// import TaskGroupList from './task-group'
// import Image from 'next/image'
// import noDataImage from '@public/images/cards/no-data.svg'
// import CustomButton from '@/components/button'
// import NewTaskDialog from '../main-screen/task-group-add-dialog'

// const Accordion = styled(MuiAccordion)<AccordionProps>(() => ({
//   boxShadow: 'none !important'
// }))

// const AccordionSummary = styled(MuiAccordionSummary)<AccordionSummaryProps>(({ theme }) => ({
//   flexDirection: 'row-reverse',
//   '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
//     transform: 'rotate(90deg)'
//   },
//   '& .MuiAccordionSummary-content': {
//     marginLeft: theme.spacing(0)
//   }
// }))

// const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
//   padding: theme?.breakpoints.up('md') && theme.spacing(0)
// }))

// interface CustomizedAccordionsType {
//   data: TaskGroup
//   index: number
// }

// export default function CustomizedAccordions({ data, index }: CustomizedAccordionsType) {
//   // ** Hooks
//   const { role } = useProject()

//   const [expanded, setExpanded] = useState<string | null>(index === 0 ? 'panel1' : null)
//   const [selectedRows, setSelectedRows] = useState<any>({})
//   const [showCard, setShowCard] = useState(false)
//   const [open, setOpen] = useState(false)

//   const handleOpen = () => setOpen(true)
//   const handleClose = () => setOpen(false)

//   const showSelected = useMemo(() => Object?.keys(selectedRows)?.length !== 0, [selectedRows])

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
//     setExpanded(newExpanded ? panel : null)
//   }

//   const {
//     data: taskList,
//     isLoading,
//     refetch: refetchTaskList
//   } = useQuery({
//     queryKey: ['task-list', data?.TaskGroupID],
//     queryFn: () => fetchTaskList(data?.TaskGroupID?.toString()),
//     retry: false,
//     enabled: !!data?.TaskGroupID
//   })

//   const {
//     data: taskGroups,
//     isLoading: taskLoading,
//     refetch: refetchTaskGroup
//   } = useQuery({
//     queryKey: ['task-group', data?.ProjectID],
//     // queryFn: () => fetchTaskGroupList(data?.ProjectID as string),
//     retry: false
//   })

//   // Check if taskGroups has values (array with at least one item)
//   const hasTaskGroups = useMemo(() => {
//     return taskGroups && Array.isArray(taskGroups) && taskGroups.length > 0
//   }, [taskGroups])

//   // Combined refetch function for both task list and task groups
//   const handleRefetchAll = async () => {
//     await Promise.all([
//       refetchTaskList(),
//       refetchTaskGroup()
//     ])
    
//     // Clear selected rows after deletion
//     setSelectedRows({})
    
//     // Collapse accordion if no tasks remain
//     if (taskList && taskList.length === 0) {
//       setExpanded(null)
//     }
//   }

//   useEffect(() => {
//     if (showSelected) {
//       setShowCard(true)
//     } else {
//       const timeout = setTimeout(() => setShowCard(false), 200) // Duration of the unmounting animation

//       return () => clearTimeout(timeout)
//     }
//   }, [showSelected])

//   // Reset selected rows when taskList changes (after deletion)
//   useEffect(() => {
//     if (taskList && taskList.length === 0) {
//       setSelectedRows({})
//       setExpanded(null)
//     }
//   }, [taskList])

//   return (
//     <>
//       {hasTaskGroups ? (
//         <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
//           <AccordionSummary
//             expandIcon={<Icon icon={'tabler:chevron-right'} />}
//             aria-controls='panel1d-content'
//             id='panel1d-header'
//             sx={{ pl: 2 }}
//           >
//             <div className='flex items-center justify-between gap-1 w-full'>
//               <Typography ml={3} fontWeight={700}>
//                 {data?.TaskGroupName ?? '-'}
//               </Typography>
//               <TaskGroupActions 
//                 groupName={data.TaskGroupName} 
//                 id={data.TaskGroupID} 
//                 ProjectID={data.ProjectID} 
//                 refetch={refetchTaskGroup}  
//               />
//             </div>
//           </AccordionSummary>
//           <AccordionDetails>
//             <div className='px-0 lg:px-3 py-2 lg:py-5 border-none lg:border-2 border-actionHover rounded-xl'>
//               <Grid2 container spacing={7}>
//                 <Grid2 size={12} overflow={'hidden'}>
//                   <TaskTable
//                     taskList={taskList}
//                     selectedRows={selectedRows}
//                     isLoading={isLoading}
//                     taskGroupID={data?.TaskGroupID}
//                     refetch={refetchTaskList}
//                     setSelectedRows={setSelectedRows}
//                   />
//                 </Grid2>
//                 {showCard && role?.RoleName !== 'Viewer' && (
//                   <DeleteTasksComponent
//                     showCard={showCard}
//                     selectedRows={selectedRows}
//                     taskList={taskList}
//                     refetch={handleRefetchAll} // Use the combined refetch function
//                     setSelectedRows={setSelectedRows}
//                   />
//                 )}
//               </Grid2>
//             </div>
//           </AccordionDetails>
//         </Accordion>
//       ) : (
//         <div className='px-3 py-10 flex gap-10 items-center justify-center flex-col'>
//           <Image src={noDataImage} alt='NoDataFound' width={300} />
//           <Typography fontWeight={600}>No Task Groups Added</Typography>
//           {role?.RoleName === 'Admin' && (
//             <CustomButton variant='contained' circular onClick={handleOpen}>
//               Add Now
//             </CustomButton>
//           )}
//           <NewTaskDialog open={open} onCloseModal={handleClose} />
//         </div>
//       )}
//     </>
//   )
// }
