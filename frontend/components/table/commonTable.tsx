"use client";
import {
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@heroui/react";
import { ReactElement, ReactNode } from "react";
export interface CellProps {
    /** The contents of the cell. */
    children: ReactNode,
    /** A string representation of the cell's contents, used for features like typeahead. */
    textValue?: string,
    /** Indicates how many columns the data cell spans. */
    colSpan?: number
}

export type CellElement = ReactElement<CellProps>;
export interface TableRenderedEntity<T> {
    Header: string;
    ColumnRenderer: (d: T) => ReactNode
}
export type TableRendererEntities<T> = TableRenderedEntity<T>[];
export type TableConfig<T> = {
    tableRendererEntities: TableRendererEntities<T>
    data: T[]
    getRowKey: (d: T) => string
}
export default function CommonTable<T>({ page, setPage, pages, tableConfig, isLoading }:
    { page: number, setPage: (n: number) => void, pages: number, tableConfig: TableConfig<T>, isLoading: boolean }): ReactNode {
    return (
        <Table
            aria-label="Users table"
            bottomContent={
                <div className="flex w-full justify-center">
                    <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={pages}
                        onChange={(page) => setPage(page)}
                    />
                </div>
            }
            classNames={{
                wrapper: "min-h-[400px]",
            }}
        >
            <TableHeader>
                {tableConfig.tableRendererEntities.map((entity, index) => (
                    <TableColumn key={index} className="text-left">
                        {entity.Header}
                    </TableColumn>
                ))}
            </TableHeader>
            <TableBody>
                {tableConfig.data.map((data, index) => {
                    return (
                        <TableRow key={tableConfig.getRowKey(data)}>
                            {...tableConfig.tableRendererEntities.map(
                                (renderer) => <TableCell>{renderer.ColumnRenderer(data)}</TableCell>
                            )}
                        </TableRow>
                    )
                })}

            </TableBody>
        </Table>)
}


// tableConfig.tableRendererEntities.map(
//     (entity, index) => {
//         return (
//             <TableCell></TableCell>
//         )
//     }
// )