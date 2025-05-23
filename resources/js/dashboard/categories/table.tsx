import { ColumnType } from '@/types';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import DataTable from '../table';

const columns: ColumnType[] = [
    {
        key: 'id',
        label: 'ID',
    },
    {
        key: 'name',
        label: 'Name',
    },
    {
        key: 'description',
        label: 'Description',
    },
    {
        key: 'actions',
        label: 'Actions',
    },
];

export default function CategoriesTable() {
    const { categories } = usePage().props as unknown as {
        categories: {
            id: number;
            name: string;
            description: string;
        }[];
    };
    const [source] = useState(categories);

    return (
        <div className="w-full overflow-x-auto">
            <DataTable columns={columns} data={source} create={false} />
        </div>
    );
}
