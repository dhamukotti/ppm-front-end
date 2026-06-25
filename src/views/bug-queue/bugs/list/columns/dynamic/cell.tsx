import { useMemo, useEffect } from 'react'

import type { Getter } from '@tanstack/react-table'

// Import the necessary components - adjust the import paths based on your project structure
import TaskPeople from '../people'
import TaskStatus from '../status'
import DynamicDate from '../dynamic/date-type'
import DynamicDropdown from '../dynamic/dropdown'
import DynamicFiles from '../dynamic/file-upload'
import TaskTextValues from '../dynamic/text-value'

interface SprintDynamicCellProps {
  getValue: Getter<unknown>
  index: number
  row: any  // Sprint item
  id: string
  columnItem: any  // Dynamic column from colList
  table: any
  value: any  // The dynamic value from colvalueList
  refetch: () => void
}

const SprintDynamicCell = (props: SprintDynamicCellProps) => {
  // ** PROPS
  const { getValue, index, row, id, table, columnItem, value, refetch } = props
  // Get column type from the column item
  // The column item from colList has typeID and lookups information
  const getColumnType = useMemo(() => {
    // Check for typeID (1=People, 2=Date, 3=Dropdown, 4=Label/Status, 5=Number, 6=Text, 7=File)
    if (columnItem.lookups.key === 'USR') return 'USR'; // People
    if (columnItem.lookups.key=== 'DPK') return 'DPK'; // Date
    if (columnItem.lookups.key === 'DDL') return 'DDL'; // Dropdown (changed from DDN to DDL to match creation menu)
    if (columnItem.lookups.key === 'LBL') return 'LBL'; // Label/Status
    if (columnItem.lookups.key=== 'NUM') return 'NUM'; // Number
    if (columnItem.lookups.key=== 'TXT') return 'TXT'; // Text
    if (columnItem.lookups.key === 'FLE') return 'FLE'; // File
    return 'TXT'; // Default to Text
  }, [columnItem?.typeID]);

  // Get column type name from lookups or typeID
  const getColumnTypeName = useMemo(() => {
    if (columnItem?.lookups?.key) return columnItem.lookups.key;
    if (columnItem?.dynamicColumnTypeInfo) {
      const parts = columnItem.dynamicColumnTypeInfo.split(';');
      if (parts.length > 2) return parts[2];
    }
    return getColumnType;
  }, [columnItem, getColumnType]);

  // Format the dynamic value to match the expected structure
  const formattedDynamicValue = useMemo(() => {
    if (!value) return null;
    
    // If value is already an object with DynamicColumnValues, use it
    if (typeof value === 'object' && value !== null) {
      return value;
    }
    
    // If value is a primitive, create an object
    return {
      DynamicColumnValues: value,
      AdditionalColumnID: columnItem?.additionalColumnID || columnItem?.AdditionalColumnID,
      SprintID: row?.SprintID
    };
  }, [value, columnItem, row]);

  // ** "DATE" TYPE COLUMN
  if (getColumnTypeName === 'DPK' || getColumnType === 'DPK')
    return (
      <DynamicDate 
        canEdit={true} 
        allColValues={row.colvalueList} // Pass the colvalueList here
        refetch={refetch} 
        rowData={row} 
        dynamicValue={formattedDynamicValue} 
        columnData={columnItem} 
      />
    );

  // ** "USER" TYPE COLUMN
  if (getColumnTypeName === 'USR' || getColumnType === 'USR') {
    // For user type, we need to pass the value as an array
    const usersList = formattedDynamicValue ? [formattedDynamicValue] : [];

    return (
      <TaskPeople
        refetch={refetch}
        rowData={row}
        dynamicValue={usersList}
        columnData={columnItem}
        canEdit={true}
      />
    );
  }

  // ** "STATUS" TYPE COLUMN (Label)
  if (getColumnTypeName === 'LBL' || getColumnType === 'LBL')
    return (
      <TaskStatus
        // canEdit={true}
        // refetch={refetch}
        // row={row}
        // dynamicValue={formattedDynamicValue}
        // columnData={columnItem}
      />
    );

  // ** "DROPDOWN" TYPE COLUMN (changed from DDN to DDL)
  if (getColumnTypeName === 'DDL' || getColumnType === 'DDL') {
    // For dropdown, we need to pass the value as an array
    const dropdownList = formattedDynamicValue ? [formattedDynamicValue] : [];

    return (
      <DynamicDropdown
        canEdit={true}
        refetch={refetch}
        rowData={row}
        dynamicValue={dropdownList}
        columnData={columnItem}
      />
    );
  }

  // ** "FILE" TYPE COLUMN
  if (getColumnTypeName === 'FLE' || getColumnType === 'FLE')
    return (
      <DynamicFiles
        canEdit={true}
        refetch={refetch}
        allColValues={row.colvalueList} // Pass the colvalueList here
        rowData={row}
        dynamicValue={formattedDynamicValue}
        columnData={columnItem}
      />
    );

  // ** "NUMBER" TYPE COLUMN
  if (getColumnTypeName === 'NUM' || getColumnType === 'NUM')
    return (
      <TaskTextValues
        canEdit={true}
        columnData={columnItem}
        dynamicValue={formattedDynamicValue}
        getValue={getValue}
        id={id}
        rowData={row}
        index={index}
        table={table}
      />
    );

  // ** "TEXT" TYPE COLUMNS (default)
  // Always render TaskTextValues for any type that doesn't match above conditions
  // This includes TXT or any other type
  return (
    <TaskTextValues
      canEdit={true}
      columnData={columnItem}
      dynamicValue={formattedDynamicValue}
      getValue={getValue}
      id={id}
      rowData={row}
      index={index}
      table={table}
    />
  );
}

export default SprintDynamicCell;
