"use client";

import React, { FC, useMemo, useState } from "react";
import { AlertCircle, Download, MoreHorizontal, RefreshCw } from "lucide-react";
import { ActionIcon, Button, Menu } from "@mantine/core";
import { useMyQuotesQuery } from "@/api/query/customer-enquery";
import { useDownloadQuote } from "@/api/mutation/download-file.mutation";
import { QuotesTableProps } from "@/types/my-quotes/quotes.type";
import FloatingIndicator from "@/components/shared/floating-indicator/floating-indicator";
import { ColDef } from "ag-grid-community";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { Datum } from "@/api/query/types/my-quotes/my-quotes.response";
import dynamic from "next/dynamic";
import { Modal } from "@mantine/core";
import { useEnquiryDetails } from "@/api/query/enquiery-details";

const MyQuotesTable = dynamic(
  () => import("@/components/dashboard/my-quotes/my-quotes.table"),
  {
    ssr: false,
  }
);

const QuotesTable: FC<QuotesTableProps> = () => {
  const [activeTab, setActiveTab] = useState<string | null>("SQ");
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [docType, setDocType] = useState<string | null>(null);
  const [docNo, setDocNo] = useState<string | null>(null);

  const {
    data: myQuotes,
    isLoading: myQuotesLoading,
    isError: myQuotesError,
    refetch,
  } = useMyQuotesQuery(activeTab);

  const { data: myQuotesAll } = useMyQuotesQuery("SQ"); // fetch quotes separately for merge in SE tab
  const { mutateAsync: downloadQuote, isPending } = useDownloadQuote();

  const handleApprovalRoute = (quote: {
    docType: string;
    docNo: string;
    destinationCntryDocNo?: string;
    originCntryDocNo?: string;
  }) => {
    router.push(
      `/approve?docType=${quote.docType}&docNo=${quote.docNo}&cntryDocNo=${quote.destinationCntryDocNo}&originCntryDocNo=${quote.originCntryDocNo}`
    );
  };

  const { data: enquiryDetails, isLoading: enquiryLoading } = useEnquiryDetails(
    docType ?? "",
    docNo ?? ""
  );

  // ✅ Helper function for status colors
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "quoted":
        return "text-blue-600";
      case "approved":
        return "text-green-600";
      case "expired":
        return "text-red-600";
      case "waiting for quote":
        return "text-yellow-600";
      case "booking cancelled":
        return "text-red-600";
      case "booked":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  // Prepare merged data when in Enquiries tab
  const rowData = useMemo(() => {
    let list: Datum[] = [];

    // if (activeTab === "SE") {
    //   // merge enquiries + quotes
    //   list = [...(myQuotes?.data ?? []), ...(myQuotesAll?.data ?? [])];
    // } else {
    list = myQuotes?.data ?? [];
    // }

    return list.map((item) => {
      const parsedDate = dayjs(item.date, "YYYY-MM-DD HH:mm:ss.SSSZ").toDate();
      return {
        ...item,
        date: parsedDate,
        time: item.time,
        status: item.status ?? "N/A",
      };
    });
  }, [activeTab, myQuotes, myQuotesAll]);

  // Mobile columns
  const mobileColDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Route",
        field: "origin",
        sortable: true,
        width: 200,
        cellRenderer: (params) => (
          <div className="py-1">
            <div className="font-medium text-sm">{params.data.origin}</div>
            <div className="text-xs text-gray-500">
              → {params.data.destination}
            </div>
          </div>
        ),
      },
      {
        headerName: "Details",
        field: "date",
        sortable: true,
        width: 150,
        cellRenderer: (params) => (
          <div className="py-1">
            <div className="font-medium text-sm">
              {dayjs(params.data.date).format("DD-MM-YYYY")}
            </div>
            <div className="font-medium text-sm">{params.data.time}</div>
            <div
              className={`text-xs font-medium ${getStatusColor(
                params.data.status
              )}`}
            >
              {params.data.status}
            </div>
          </div>
        ),
      },
      {
        headerName: "Info",
        field: "weight",
        width: 120,
        cellRenderer: (params) => (
          <div className="py-1">
            <div className="text-sm">{params.data.weight}kg</div>
            <div className="text-xs text-gray-500">{params.data.mode}</div>
          </div>
        ),
      },

      {
        headerName: "Actions",
        field: "actions",
        width: 100,
        cellRenderer: (params: { data: Datum }) => {
          // In Enquiries tab show actions ONLY for quotes
          if (activeTab === "SE" && params.data.docType !== "SQ") return null;

          if (
            activeTab === "SQ" ||
            (activeTab === "SE" && params.data.docType === "SQ")
          ) {
            return (
              <div className="flex justify-center items-center h-full">
                {params.data.approvedBy ? (
                  <ActionIcon
                    color="blue"
                    onClick={async () =>
                      await downloadQuote({
                        docType: params.data.docType,
                        docNo: params.data.docNo,
                      })
                    }
                    disabled={isPending}
                    size="sm"
                  >
                    <Download size={14} />
                  </ActionIcon>
                ) : (
                  <Menu shadow="md" width={180}>
                    <Menu.Target>
                      <ActionIcon variant="light" color="gray" size="sm">
                        <MoreHorizontal size={14} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        disabled={
                          params.data.status?.toLowerCase() === "expired" ||
                          params.data.status?.toLowerCase() ===
                            "waiting for quote"
                        }
                        onClick={() => handleApprovalRoute(params.data)}
                      >
                        Approve
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<Download size={14} />}
                        disabled={
                          params.data.status?.toLowerCase() === "expired" ||
                          params.data.status?.toLowerCase() ===
                            "waiting for quote"
                        }
                        onClick={() =>
                          downloadQuote({
                            docType: params.data.docType,
                            docNo: params.data.docNo,
                          })
                        }
                      >
                        Download
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )}
              </div>
            );
          }
          return null;
        },
      },
    ],
    [downloadQuote, isPending, activeTab, handleApprovalRoute]
  );

  // Desktop columns
  const desktopColDefs: ColDef[] = useMemo(() => {
    const baseCols: ColDef[] = [
      {
        headerName: "Sl. No",
        width: 100,
        valueGetter: (params) => params.node.rowIndex + 1,
        sortable: false,
        filter: false,
        pinned: "left",
      },

      {
        headerName:
          activeTab === "SE"
            ? "Reference No."
            : activeTab === "SQ"
            ? "Quote No."
            : activeTab === "SO"
            ? "Booking No."
            : "Enquiry No.",
        field: "docNo",
        sortable: true,
        width: 160,
        filter: true,
        floatingFilter: true,
      },
      {
        headerName: "Origin",
        field: "origin",
        sortable: true,
        width: 160,
        filter: true,
        floatingFilter: true,
      },
      {
        headerName: "Destination",
        field: "destination",
        sortable: true,
        width: 160,
        filter: true,
        floatingFilter: true,
      },
      {
        headerName: "Date",
        field: "date",
        sortable: true,
        width: 200,
        filter: "agDateColumnFilter",
        floatingFilter: true,
        valueFormatter: (params) => dayjs(params.value).format("DD-MM-YYYY"),
      },
      { headerName: "Time", field: "time", sortable: true, width: 120 },
      {
        headerName: "Status",
        field: "status",
        sortable: true,
        width: 140,
        pinned: "right",
        cellRenderer: (params) => (
          <span className={`font-medium ${getStatusColor(params.value)}`}>
            {params.value}
          </span>
        ),
      },
      {
        headerName: "Weight",
        field: "weight",
        sortable: true,
        width: 120,
        filter: true,
        floatingFilter: true,
        cellRenderer: (params: { data: Datum }) => (
          <button
            className="text-blue-600 underline cursor-pointer"
            onClick={() => {
              setDocType(params.data.docType); // set selected docType
              setDocNo(params.data.docNo); // set selected docNo
              setOpened(true); // open modal
            }}
          >
            {params.data.weight} kg
          </button>
        ),
      },
      {
        headerName: "Type",
        field: "type",
        sortable: true,
        width: 120,
        filter: true,
        floatingFilter: true,
      },
      {
        headerName: "Service",
        field: "service",
        sortable: true,
        width: 120,
        filter: true,
        floatingFilter: true,
      },
      {
        headerName: "Mode",
        field: "mode",
        sortable: true,
        filter: true,
        floatingFilter: true,
      },
    ];

    if (activeTab === "SO") {
      baseCols.unshift({
        headerName: "Quote No.",
        field: "prevDocNo",
        sortable: true,
        width: 180,
        filter: true,
        floatingFilter: true,
      });
    }

    if (activeTab === "SO") {
      baseCols.push({
        headerName: "AWB",
        field: "awb",
        sortable: true,
        width: 180,
        filter: true,
        floatingFilter: true,
      });
    }

    baseCols.push({
      headerName: "Actions",
      field: "actions",
      pinned: "right",
      width: 200,
      cellRenderer: (params: { data: Datum }) => {
        // In Enquiries tab show actions ONLY for quotes
        if (activeTab === "SE" && params.data.docType !== "SQ") return null;

        if (
          activeTab === "SQ" ||
          (activeTab === "SE" && params.data.docType === "SQ")
        ) {
          return (
            <div className="flex gap-2 items-center h-full">
              {params.data.approvedBy ? (
                <Button
                  color="blue"
                  disabled={
                    isPending ||
                    params.data.status?.toLowerCase() === "expired" ||
                    params.data.status?.toLowerCase() === "waiting for quote"
                  }
                  onClick={async () =>
                    await downloadQuote({
                      docType: params.data.docType,
                      docNo: params.data.docNo,
                    })
                  }
                  size="sm"
                  radius={"md"}
                  h={"1.8rem"}
                >
                  Download Quote
                </Button>
              ) : (
                <>
                  <Button
                    color="green"
                    onClick={() => handleApprovalRoute(params.data)}
                    disabled={
                      isPending ||
                      params.data.status?.toLowerCase() === "expired" ||
                      params.data.status?.toLowerCase() === "waiting for quote"
                    }
                    size="sm"
                    radius={"md"}
                    h={"1.8rem"}
                  >
                    Approve
                  </Button>
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <ActionIcon variant="light" color="gray">
                        <MoreHorizontal size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<Download size={16} />}
                        disabled={
                          isPending ||
                          params.data.status?.toLowerCase() === "expired" ||
                          params.data.status?.toLowerCase() ===
                            "waiting for quote"
                        }
                        onClick={() =>
                          downloadQuote({
                            docType: params.data.docType,
                            docNo: params.data.docNo,
                          })
                        }
                      >
                        Download Quote
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </>
              )}
            </div>
          );
        }
        return null;
      },
    });

    return baseCols;
  }, [downloadQuote, isPending, activeTab, handleApprovalRoute]);

  return (
    <div className="bg-gray-50 pt-24 sm:pt-28 md:pt-32 lg:pt-40 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-3">
          <FloatingIndicator
            data={[
              { label: "Enquiries", value: "SE" },
              { label: "Quotes", value: "SQ" },
              { label: "Bookings", value: "SO" },
            ]}
            active={activeTab}
            setActive={setActiveTab}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex justify-end p-3 border-b">
            <Button
              onClick={() => refetch()}
              leftSection={<RefreshCw className="w-4 h-4" />}
              size="xs"
              variant="light"
            >
              Refresh
            </Button>
          </div>

          {myQuotesError ? (
            <div className="flex items-center justify-center p-8 sm:p-12">
              <div className="text-center max-w-md">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-4 flex items-center justify-center rounded-full bg-indigo-50">
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-[#01137e]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to load quotes
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                  We encountered an issue while fetching your quotes. Please
                  check your connection and try again.
                </p>
                <Button
                  onClick={() => refetch()}
                  rightSection={<RefreshCw className="w-4 h-4" />}
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <MyQuotesTable
              myQuotesLoading={myQuotesLoading}
              rowData={rowData}
              activeTab={activeTab}
              isPending={isPending}
              mobileColDefs={mobileColDefs}
              desktopColDefs={desktopColDefs}
              downloadQuote={downloadQuote}
              handleApprovalRoute={handleApprovalRoute}
            />
          )}
        </div>
      </div>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Item Details"
        centered
        size="lg"
      >
        {enquiryLoading ? (
          <div className="text-center py-6">Loading...</div>
        ) : enquiryDetails?.data[0]?.itemdetails?.length ? (
          <div className="space-y-4">
            {enquiryDetails.data[0].itemdetails.map((item, i) => (
              <div
                key={i}
                className="border rounded-lg p-3 shadow-sm text-sm flex flex-col gap-1"
              >
                <div>
                  <b>Quantity:</b> {item.quantity}
                </div>
                <div>
                  <b>Actual Weight:</b> {item.actWeight} kg
                </div>
                <div>
                  <b>Chargeable Weight:</b> {item.chargeableWeight} kg
                </div>
                <div>
                  <b>Dimensions:</b> {item.lengthInCm} × {item.breadthInCm} ×{" "}
                  {item.heightInCm} cm
                </div>
                <div>
                  <b>Girth:</b> {item.girth} cm
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No item details found
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuotesTable;
