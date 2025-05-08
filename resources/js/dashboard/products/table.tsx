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
        key: 'sku',
        label: 'SKU',
    },
    {
        key: 'price',
        label: 'Price',
    },
    {
        key: 'stock',
        label: 'Stock',
    },
    {
        key: 'category',
        label: 'Category',
    },
    {
        key: 'actions',
        label: 'Actions',
    },
];

export default function ProductsTable() {
    const { products } = usePage().props as unknown as {
        products: {
            id: number;
            name: string;
            description: string;
        }[];
    };
    const [source] = useState(products);

    return (
        <div className="w-full overflow-x-auto">
            <DataTable columns={columns} data={source} create={false} />
        </div>
    );
}
