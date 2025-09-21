"use client";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { ReactNode } from "react";
export default function PageCard({ header, body, footer }: { header: ReactNode, body: ReactNode, footer: ReactNode }): ReactNode {
    return (
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader className="pb-4">
                {header}
            </CardHeader>

            <CardBody>
                {body}
                <Divider className="my-6" />
                {footer}
            </CardBody>
        </Card>
    )
}