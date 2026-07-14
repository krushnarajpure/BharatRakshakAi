import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";

const requests = [
  {
    name: "Rahul Sharma",
    location: "Chennai",
    severity: "Critical",
    status: "Awaiting Rescue",
  },
  {
    name: "Priya Das",
    location: "Assam",
    severity: "High",
    status: "Assigned",
  },
  {
    name: "Arjun Singh",
    location: "Odisha",
    severity: "Critical",
    status: "En Route",
  },
  {
    name: "Neha Verma",
    location: "Rajasthan",
    severity: "Moderate",
    status: "Monitoring",
  },
];

export function SOSTable() {
  return (
    <Card className="border-cyan-300/10 bg-[#08111a]">
      <CardContent className="p-5">
        <h3 className="mb-5 text-lg font-semibold text-white">
          SOS Requests
        </h3>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.name}>
                <TableCell>{request.name}</TableCell>

                <TableCell>
                  {request.location}
                </TableCell>

                <TableCell>
                  {request.severity}
                </TableCell>

                <TableCell>
                  {request.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}