"use client";


import {
  Loader,
  Avatar,
} from "@mantine/core";

import { useCustomerInfo } from "@/api/query/customer-info.query";
import { Customer } from "@/api/query/types/customer-info/customer-info.type";
import { User, Phone, MapPin, Contact } from "lucide-react";

export default function CustomerDetailsPage() {
  const { data, isLoading, isError } = useCustomerInfo();

  if (isLoading) {
    return (
      <div className="bg-gray-50 pt-24 sm:pt-28 md:pt-32 lg:pt-40 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <Loader size="lg" color="blue" />
              <p className="text-gray-600 text-sm sm:text-base">Loading customer details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-gray-50 pt-24 sm:pt-28 md:pt-32 lg:pt-40 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <div className="bg-white rounded-xl p-8 sm:p-12 border border-red-200 shadow-sm max-w-md w-full">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-4 flex items-center justify-center rounded-full bg-red-50">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to load details
                </h3>
                <p className="text-red-600 text-sm sm:text-base">
                  Failed to load customer details. Please try again later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const customer: Customer = data?.data?.[0];

  return (
    <div className="bg-gray-50 pt-24 sm:pt-28 md:pt-32 lg:pt-40 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="mb-4">
                <Avatar
                  size="xl"
                  radius="100%"
                  color="blue"
                >
                  {customer?.customerName?.charAt(0).toUpperCase() || "?"}
                </Avatar>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {customer?.customerName || "Unknown User"}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {customer?.email || "No email provided"}
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Contact Information
              </h3>

              {/* Phone */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                  <p className="text-base text-gray-800 break-all">
                    {customer?.mobile || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                  <p className="text-base text-gray-800 break-words leading-relaxed">
                    {customer?.address || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Contact Person */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                  <Contact className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">Contact Person</p>
                  <p className="text-base text-gray-800 break-all">
                    {customer?.contactName || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

        {/* Footer Space */}
        <div className="pb-8"></div>
      </div>
    </div>
  );
}