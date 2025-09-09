import { useMutation } from "@tanstack/react-query";
import { baseService } from "../base.service";
import { EnquiryRequest } from "../types/enquires/enqueryRequest";
import { EnquiryResponse } from "../types/enquires/enquiry.response";




export const useEnquiryMutation = () => {
  return useMutation<EnquiryResponse, Error, EnquiryRequest>({
    mutationFn: async (data) => {
      const response = await baseService<EnquiryResponse, EnquiryRequest>({
        method: "POST",
        url: "customer-portal/customer-enquiry/",
        data: data,
      });
      return response;
    },
    retry: 1,
  });
};
