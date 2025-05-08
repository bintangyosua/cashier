import { RevoGrid } from '@revolist/react-datagrid';
import { useState } from 'react';

const columns = [
    {
        prop: 'name',
        name: 'First',
    },
    {
        prop: 'details',
        name: 'Second',
    },
];

export default function Categories() {
    const [source] = useState([
        {
            name: '1',
            details: 'Item 1',
        },
        {
            name: '2',
            details: 'Item 2',
        },
    ]);
    return (
        <>
            <RevoGrid columns={columns} source={source} />
        </>
    );
}
