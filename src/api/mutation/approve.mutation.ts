// src/api/mutations/quote-approve.mutation.ts
import { useMutation } from "@tanstack/react-query";
import { baseService } from "../base.service";
import { QuoteApproveRequest } from "../types/approve/approve.request";
import { QuoteApproveResponse } from "../types/approve/approve.response";

export const useQuoteApproveMutation = () => {
  return useMutation<QuoteApproveResponse, Error, QuoteApproveRequest>({
    mutationFn: async (
      data: QuoteApproveRequest
    ): Promise<QuoteApproveResponse> => {
      const response = await baseService<
        QuoteApproveResponse,
        QuoteApproveRequest
      >({
        method: "POST",
        url: `customer-portal/quote-approve/?docType=${data.docType}&docNo=${data.docNo}`,
        data,
      });

      return response;
    },
    retry: 1,
  });
};
