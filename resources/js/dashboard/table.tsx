'use client';

import { ColumnType } from '@/types';
import {
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Image,
    Input,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from '@heroui/react';
import { useAsyncList } from '@react-stately/data';
import React, { useEffect, useState } from 'react';
import { capitalize, ChevronDownIcon, PlusIcon, SearchIcon, VerticalDotsIcon } from './dummy';

export default function DataTable({
    rowsPerPageCol,
    data,
    columns,
    DataModal,
    create,
    categoryColumns = [],
    onSelectedKeysChange,
}: {
    rowsPerPageCol?: number;
    data: Record<string, any>[];
    columns: ColumnType[];
    DataModal?: React.ComponentType<{
        isOpen: boolean;
        onOpenChange: () => void;
        mode?: 'create' | 'edit';
        defaultValues?: any;
    }>;
    create: boolean;
    categoryColumns?: string[]; // Array of column keys that are categories
    onSelectedKeysChange?: (keys: Set<string[]>) => void;
}) {
    const INITIAL_VISIBLE_COLUMNS = columns.map((column) => column.key);

    const [selectedKeys, setSelectedKeys] = useState<any>(new Set());
    const [page, setPage] = useState(1);
    const createModal = useDisclosure();
    const editModal = useDisclosure();
    const [selectedItem, setSelectedItem] = useState<Record<string, any>>({});
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageCol ?? 10);

    const [categoryFilters, setCategoryFilters] = useState<Record<string, Set<string>>>(
        // Initialize each category with "all" selected
        categoryColumns.reduce(
            (acc, category) => {
                acc[category] = new Set(['all']);
                return acc;
            },
            {} as Record<string, Set<string>>,
        ),
    );

    useEffect(() => {
        if (onSelectedKeysChange) {
            onSelectedKeysChange(selectedKeys);
        }
    }, [selectedKeys]);

    const [filterValue, setFilterValue] = React.useState('');
    const [visibleColumns, setVisibleColumns] = React.useState(new Set(INITIAL_VISIBLE_COLUMNS));

    const [selectedSearchByDropdownValue, setSelectedSearchByDropdownValue] = React.useState<{ key: string; label: string }>({
        key: columns[0].key,
        label: columns[0].label,
    });

    const selectedSearchByDropdownValueOf = React.useMemo(() => selectedSearchByDropdownValue.key, [selectedSearchByDropdownValue]);

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns.has('all')) return columns;

        return columns.filter((column) => Array.from(visibleColumns).includes(column.key));
    }, [visibleColumns, columns]);

    let list = useAsyncList({
        async load({ signal }) {
            return {
                items: data,
            };
        },

        async sort({ items, sortDescriptor }) {
            return {
                items: items.sort((a: any, b: any) => {
                    let first = a[sortDescriptor.column];
                    let second = b[sortDescriptor.column];
                    let cmp = (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;

                    if (sortDescriptor.direction === 'descending') {
                        cmp *= -1;
                    }

                    return cmp;
                }),
            };
        },
    });

    // Generate unique values for each category column
    const categoryOptions = React.useMemo(() => {
        const options: Record<string, Array<{ uid: string; name: string }>> = {};

        categoryColumns.forEach((category) => {
            const values = list.items.map((item: any) => item[category]);
            const uniqueValues = Array.from(new Set(values));

            options[category] = [
                { uid: 'all', name: 'all' },
                ...uniqueValues.map((value) => ({
                    uid: String(value),
                    name: String(value),
                })),
            ];
        });

        return options;
    }, [list.items, categoryColumns]);

    const filteredItems = React.useMemo(() => {
        let filteredData = [...list.items];

        // Apply search filter
        if (hasSearchFilter) {
            filteredData = filteredData.filter((item: any) => {
                const lowerFilter = filterValue.toLowerCase();

                if (selectedSearchByDropdownValueOf === 'all') {
                    return Object.values(item).some((value) => {
                        const stringValue = typeof value === 'boolean' ? String(value) : value;
                        return String(stringValue).toLowerCase().includes(lowerFilter);
                    });
                } else {
                    const fieldValue = item[selectedSearchByDropdownValueOf];
                    const stringValue = typeof fieldValue === 'boolean' ? String(fieldValue) : fieldValue;
                    return stringValue && String(stringValue).toLowerCase().includes(lowerFilter);
                }
            });
        }

        // Apply category filters
        categoryColumns.forEach((category) => {
            const categoryFilter = categoryFilters[category];
            if (categoryFilter && !categoryFilter.has('all')) {
                filteredData = filteredData.filter((item: any) => categoryFilter.has(String(item[category])));
            }
        });

        return filteredData;
    }, [list.items, filterValue, categoryFilters, hasSearchFilter, selectedSearchByDropdownValueOf, categoryColumns]);

    const handleCategoryFilterChange = (category: string, selection: any) => {
        // If nothing is selected, default to "all"
        if (selection.size === 0) {
            setCategoryFilters((prev) => ({
                ...prev,
                [category]: new Set(['all']),
            }));
            return;
        }

        // Update the specific category filter
        setCategoryFilters((prev) => ({
            ...prev,
            [category]: selection,
        }));
    };

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const paginatedItems = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const onClear = React.useCallback(() => {
        setFilterValue('');
        setPage(1);
    }, []);

    const onSearchChange = React.useCallback((value: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue('');
        }
    }, []);

    const onNextPage = React.useCallback(() => {
        if (page < pages) {
            setPage(page + 1);
        }
    }, [page, pages]);

    const onPreviousPage = React.useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page]);

    const classNames = React.useMemo(
        () => ({
            wrapper: ['w-full bg-transparent shadow-none p-0'],
            th: ['bg-transparent', 'text-default-500', 'border-b', 'border-divider'],
            td: [
                // changing the rows border radius
                // first
                'group-data-[first=true]/tr:first:before:rounded-none',
                'group-data-[first=true]/tr:last:before:rounded-none',
                // middle
                'group-data-[middle=true]/tr:before:rounded-none',
                // last
                'group-data-[last=true]/tr:first:before:rounded-none',
                'group-data-[last=true]/tr:last:before:rounded-none',
            ],
        }),
        [],
    );

    const editItem = (item: Record<string, any>) => {
        setSelectedItem(item);
        editModal.onOpen();
    };

    const renderCell = React.useCallback(
        (item: Record<string, any>, columnKey: string) => {
            const cellValue = item[columnKey];

            // Get the column definition to check for special properties
            const columnDef = columns.find((col) => col.key === columnKey);

            // Handle image columns
            if (columnDef?.image === true) {
                return (
                    <div className="flex justify-start">
                        {cellValue ? (
                            <Image src={cellValue} alt={`${columnKey} image`} width={80} height={80} className="object-cover" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-start rounded-sm bg-gray-100">
                                <span className="text-tiny text-gray-500">N/A</span>
                            </div>
                        )}
                    </div>
                );
            }

            switch (columnKey) {
                case 'actions': {
                    return (
                        <div className="relative flex items-center justify-center gap-2">
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button isIconOnly size="sm" variant="light">
                                        <VerticalDotsIcon className="text-default-300" height={16} width={16} />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu>
                                    <DropdownItem key="view">View</DropdownItem>
                                    <DropdownItem
                                        key="edit"
                                        onClick={editModal.onOpen}
                                        onPress={() => {
                                            editItem(item);
                                        }}
                                    >
                                        Edit
                                    </DropdownItem>
                                    <DropdownItem key="delete">Delete</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    );
                }
                default:
                    if (typeof cellValue === 'boolean') {
                        return (
                            <Chip className="capitalize" color={cellValue ? 'success' : 'danger'} size="sm" variant="flat">
                                {cellValue ? 'True' : 'False'}
                            </Chip>
                        );
                    }

                    // For category columns, we can apply different styling if needed
                    if (categoryColumns.includes(columnKey)) {
                        return (
                            <div className="flex flex-col">
                                <p className="text-bold text-small capitalize">{cellValue}</p>
                            </div>
                        );
                    }

                    // Handle null or undefined values
                    if (cellValue === null || cellValue === undefined) {
                        return '-';
                    }

                    // Handle other types
                    return cellValue.toString();
            }
        },
        [categoryColumns],
    );

    return (
        <div className="flex flex-col gap-4 rounded-xl">
            <div className="flex items-end justify-between gap-3">
                <div className="flex gap-3">
                    <Input
                        isClearable
                        className=""
                        classNames={{
                            innerWrapper: 'gap-1',
                            base: 'w-full',
                            inputWrapper: 'border-1 h-10',
                        }}
                        placeholder={`Search by ${selectedSearchByDropdownValue.label.toLowerCase()}...`}
                        startContent={<SearchIcon className="text-default-300" />}
                        value={filterValue}
                        variant="bordered"
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <Dropdown>
                        <DropdownTrigger className="hidden sm:flex">
                            <Button className="text-default-600 border-1 capitalize" variant="faded">
                                {capitalize(selectedSearchByDropdownValue.label.toLowerCase())}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            disallowEmptySelection
                            aria-label="Single selection example"
                            selectedKeys={selectedSearchByDropdownValue.key}
                            selectionMode="single"
                            onSelectionChange={(keys) =>
                                setSelectedSearchByDropdownValue({
                                    key: keys.anchorKey ?? '',
                                    label: columns.find((column) => column.key === keys.anchorKey)?.label ?? '',
                                })
                            }
                        >
                            {columns
                                .filter((column) => column.key !== 'actions')
                                .map((column) => (
                                    <DropdownItem
                                        key={column.key}
                                        className="capitalize"
                                        onSelect={() =>
                                            setSelectedKeys((prevKeys: Iterable<unknown> | null | undefined) =>
                                                new Set(prevKeys).add(column.key.toLowerCase()),
                                            )
                                        }
                                    >
                                        {capitalize(column.label)}
                                    </DropdownItem>
                                ))}
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div className="flex gap-3">
                    {/* Render category filter dropdowns */}
                    {categoryColumns.map((category) => {
                        const options = categoryOptions[category] || [];
                        const columnInfo = columns.find((col) => col.key === category);
                        const columnLabel = columnInfo ? columnInfo.label : category;

                        return (
                            <Dropdown key={category}>
                                <DropdownTrigger className="hidden sm:flex">
                                    <Button className="border-1" endContent={<ChevronDownIcon className="text-small" />} variant="faded">
                                        {capitalize(columnLabel)}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    className="bg-primary max-h-96 overflow-y-scroll"
                                    disallowEmptySelection
                                    aria-label={`Filter by ${columnLabel}`}
                                    closeOnSelect={false}
                                    selectedKeys={categoryFilters[category]}
                                    selectionMode="multiple"
                                    onSelectionChange={(selection) => handleCategoryFilterChange(category, selection)}
                                >
                                    {options
                                        .sort((a, b) => {
                                            // All selalu di paling atas
                                            if (a.uid === 'all') return -1;
                                            if (b.uid === 'all') return 1;

                                            // Kemudian item yang dipilih
                                            const aSelected = categoryFilters[category].has(a.uid);
                                            const bSelected = categoryFilters[category].has(b.uid);

                                            if (aSelected && !bSelected) return -1; // a di atas b
                                            if (!aSelected && bSelected) return 1; // b di atas a

                                            // Jika keduanya dipilih atau keduanya tidak dipilih, urutkan berdasarkan nama
                                            return a.name.localeCompare(b.name);
                                        })
                                        .map((option) => (
                                            <DropdownItem key={option.uid} className="capitalize">
                                                {capitalize(option.name)}
                                            </DropdownItem>
                                        ))}
                                </DropdownMenu>
                            </Dropdown>
                        );
                    })}

                    {/* Column visibility dropdown */}
                    <Dropdown>
                        <DropdownTrigger className="hidden sm:flex">
                            <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                                Columns
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            color="danger"
                            disallowEmptySelection
                            aria-label="Table Columns"
                            closeOnSelect={false}
                            selectedKeys={visibleColumns}
                            selectionMode="multiple"
                            onSelectionChange={(keys) => setVisibleColumns(keys as Set<string>)}
                        >
                            {columns.map((column) => (
                                <DropdownItem key={column.key} className="capitalize" color="default">
                                    {capitalize(column.label)}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>

                    {/* Create button */}
                    {DataModal && create && (
                        <>
                            <Button color="primary" onPress={createModal.onOpen} endContent={<PlusIcon height={16} width={16} />}>
                                Add New
                            </Button>
                            <DataModal isOpen={createModal.isOpen} onOpenChange={createModal.onOpenChange} />
                        </>
                    )}

                    {DataModal && (
                        <DataModal isOpen={editModal.isOpen} onOpenChange={editModal.onOpenChange} mode="edit" defaultValues={selectedItem} />
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-default-400 text-small">Total {data.length} users</span>
                {/* <label className="flex items-center text-default-400 text-small w-fit">
          Rows per page:
          <select
            defaultValue={rowsPerPage}
            className="bg-transparent outline-none text-default-400 text-small"
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1); // Reset to page 1 whenever rows per page changes
            }}
          >
            {[5, 10, 15, 20].map((pageSize, key) => (
              <option key={key} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </label> */}
            </div>
            <Table
                aria-label="Example table with dynamic content"
                isHeaderSticky
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                bottomContentPlacement="outside"
                classNames={classNames}
                checkboxesProps={{
                    classNames: {
                        wrapper: 'after:bg-foreground after:text-background text-background',
                        label: 'flex items-center justify-center',
                        base: 'flex items-center justify-center',
                        icon: 'flex items-center justify-center',
                        hiddenInput: 'h-4 mt-2.5',
                    },
                }}
                onSelectionChange={setSelectedKeys}
                sortDescriptor={list.sortDescriptor}
                topContentPlacement="inside"
                onSortChange={list.sort}
                bottomContent={
                    <div className="flex w-full justify-between">
                        <span className="text-small text-default-400 w-[30%]">
                            {selectedKeys === 'all' ? 'All items selected' : `${selectedKeys.size} of ${filteredItems.length} selected`}
                        </span>
                        <Pagination isCompact showControls showShadow color="default" page={page} total={pages} onChange={(page) => setPage(page)} />
                        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
                            <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
                                Previous
                            </Button>
                            <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
                                Next
                            </Button>
                        </div>
                    </div>
                }
            >
                <TableHeader columns={headerColumns}>
                    {(column) => (
                        <TableColumn key={column.key} allowsSorting align={column.key === 'actions' ? 'center' : 'start'}>
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={paginatedItems} emptyContent="No users found">
                    {(item: any) => (
                        <TableRow key={item.key}>
                            {(columnKey) => (
                                <TableCell>
                                    <>{renderCell(item, columnKey.toString())}</>
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
