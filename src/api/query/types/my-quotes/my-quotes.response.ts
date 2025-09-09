export interface MyQuotesResponse {
    data: Datum[];
    statusCode: number;
    message: string;
    metadata: string;
}

export interface Datum {
    docType: string;
    docNo: string;
    date: string;
    time: string;
    status: null;
    originCntryDocNo: string;
    origin: string;
    destinationCntryDocNo: string;
    destination: string;
    weight: string;
    type: string;
    service: string;
    mode: string;
    createdBy: string;
    approvedBy: string;
}
