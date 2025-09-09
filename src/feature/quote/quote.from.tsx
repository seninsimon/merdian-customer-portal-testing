"use client";

import React, { FC, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button, NumberInput, Select, Checkbox, Modal } from "@mantine/core";
import { useForm } from "@mantine/form";
import DeleteActionButton from "@/components/shared/action-buttons/delete.action";
import { useEnquiryMutation } from "@/api/mutation/enquiry.mutation";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import {
  enqDetailsPropsType,
  EnquiryPropsType,
} from "@/types/get-a-quote/quote-form.type";
import { useDropDown } from "@/api/query/drop-down.query";
import { Country, setmDocNoType } from "@/types/quote.form/quote.form.type";

const QuoteForm: FC = () => {
  const { mutate, isPending } = useEnquiryMutation();
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm<EnquiryPropsType>({
    initialValues: {
      docDate: new Date(),
      stmDocNo: "",
      cusDocNo: "",
      originCountry: "231",
      destinationCountry: "",
      setmDocNo: "1001",
      slmDocNo: "",
      grossWeight: 0,
      totalPackage: 0,
      totalWeight: 0,
      volumeWeight: 0,
      chargeableWeight: 0,
      time: "",
      dimFactor: 0,
      isStackable: true,
      isDangerous: false,
      isNonStackable: false,
      isFreightService: true,
      enqDetails: [
        {
          id: "1",
          actWeight: 0,
          length: 0,
          breadth: 0,
          height: 0,
          volumeWeight: 0,
          girth: 0,
          chargeableWeight: 0,
          status: "pending",
          quantity: 0,
          lengthInCm: 0,
          breadthInCm: 0,
          heightInCm: 0,
          actWeightInKg: 0,
        },
      ],
    },
    validate: {
      originCountry: (value) =>
        value.trim().length > 0 ? null : "Origin country is required",

      destinationCountry: (value) =>
        value.trim().length > 0 ? null : "Destination country is required",

      setmDocNo: (value) =>
        value.trim().length > 0 ? null : "Service type is required",

      enqDetails: {
        actWeight: (value) =>
          value > 0 ? null : "Weight must be greater than 0",

        lengthInCm: (value) =>
          value > 0 ? null : "Length must be greater than 0",

        breadthInCm: (value) =>
          value > 0 ? null : "Breadth must be greater than 0",

        heightInCm: (value) =>
          value > 0 ? null : "Height must be greater than 0",

        quantity: (value) => (value > 0 ? null : "Quantity must be at least 1"),
      },
    },
  });

  const addItem = () => {
    const newItem: enqDetailsPropsType = {
      id: Date.now().toString(),
      actWeight: 0,
      length: 0,
      breadth: 0,
      height: 0,
      volumeWeight: 0,
      girth: 0,
      chargeableWeight: 0,
      status: "pending",
      quantity: 0,
      lengthInCm: 0,
      breadthInCm: 0,
      heightInCm: 0,
      actWeightInKg: 0,
    };
    form.setFieldValue("enqDetails", [...form.values.enqDetails, newItem]);
  };

  const removeItem = (id: string) => {
    if (form.values.enqDetails.length > 1) {
      form.setFieldValue(
        "enqDetails",
        form.values.enqDetails.filter((item) => item.id !== id)
      );
    }
  };

  const { data: countries, isLoading: isCountriesLoading } =
    useDropDown<Country>("CNTRY");

  const { data: setmDocNo, isLoading: isServiceLoading } =
    useDropDown<setmDocNoType>("SETM");

  const handleSubmit = (values: EnquiryPropsType) => {
      const updatedDetails = values.enqDetails.map((item) => {
    const weight = (item.actWeight || 0) * (item.quantity || 1);
    return { ...item, chargeableWeight: weight };
  });

   const totalChargeable = updatedDetails.reduce(
    (sum, item) => sum + item.chargeableWeight,
    0
  );

   const updatedValues = {
    ...values,
    enqDetails: updatedDetails,
    chargeableWeight: totalChargeable,
  };
    mutate(updatedValues, {
      onSuccess: () => {
        open();
      },
      onError: (err) => {
        notifications.show({
          title: "Error",
          message: err.message,
          color: "red",
        });
      },
    });
  };

  const totalChargeableWeight = form.values.enqDetails.reduce(
    (total, item) => total + (item.actWeight || 0) * (item.quantity || 1),
    0
  );

  // sync chargeableWeight into form state whenever details change
  useEffect(() => {
    form.setFieldValue("chargeableWeight", totalChargeableWeight);
  }, [totalChargeableWeight]); // runs only when recalculated

  return (
    <div className="max-w-7xl mx-auto  min-h-screen">
      <div className=" rounded-xl  p-6 mb-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Get a Quote</h1>
            <p className="text-gray-600 mt-1">
              Fill in your shipment details to get an instant quote
            </p>
          </div>
          {/* <div className="w-24  h-24 rounded-lg flex items-center justify-center p-2  ">
          
            <div className="text-center">
              <div className="w-40 h-40 pr-10 flex items-center justify-center mx-auto mb-1">
                <Image
                  src="/images/logo/departure.png"
                  alt="Courier Logo"
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>
            </div>
          </div> */}
        </div>

        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6   rounded-lg">
            <Select
              label="Service Type"
              placeholder={
                isServiceLoading ? "Loading..." : "Select Service Type"
              }
              data={setmDocNo}
              searchable
              withAsterisk
              {...form.getInputProps("setmDocNo")} 
            />

            <Select
              label="Origin Country"
              placeholder={
                isCountriesLoading ? "Loading..." : "Select origin country"
              }
              data={countries}
              searchable
              withAsterisk
              {...form.getInputProps("originCountry")}
            />

            <Select
              label="Destination Country"
              placeholder="Select destination country"
              data={countries}
              searchable
              withAsterisk
              {...form.getInputProps("destinationCountry")}
            />
          </div>

          <div className="space-y-6">
            <div className=" border-gray-200  pb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Package Details
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Provide details about the package dimensions and weight.
              </p>
            </div>

            <div className="grid  bg-white grid-cols-1 gap-4">
              {form.values.enqDetails.map((item, index) => (
                <div
                  key={item.id}
                  className=" border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900 text-lg flex items-center">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                        {index + 1}
                      </span>
                    </h4>
                    {form.values.enqDetails.length > 1 && (
                      <DeleteActionButton onClick={() => removeItem(item.id)} />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <NumberInput
                      label="Weight (kg)"
                      placeholder="e.g., 10.5"
                      min={0}
                      withAsterisk
                      {...form.getInputProps(`enqDetails.${index}.actWeight`)}
                    />

                    <NumberInput
                      label="Length (cm)"
                      placeholder="e.g., 100"
                      min={0}
                      withAsterisk
                      {...form.getInputProps(`enqDetails.${index}.lengthInCm`)}
                    />

                    <NumberInput
                      label="Breadth (cm)"
                      placeholder="e.g., 50"
                      min={0}
                      withAsterisk
                      {...form.getInputProps(`enqDetails.${index}.breadthInCm`)}
                    />

                    <NumberInput
                      label="Height (cm)"
                      placeholder="e.g., 30"
                      min={0}
                      withAsterisk
                      {...form.getInputProps(`enqDetails.${index}.heightInCm`)}
                    />

                    <NumberInput
                      label="Item Quantity"
                      placeholder="e.g., 1"
                      min={1}
                      withAsterisk
                      {...form.getInputProps(`enqDetails.${index}.quantity`)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={addItem}
                variant="light"
                h={"2.7rem"}
                leftSection={<Plus size={16} />}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
              >
                Add New Item
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Items Total Weight */}
            <div className="lg:col-span-1 ">
              <div className=" border bg-white   border-gray-200 rounded-xl p-6 shadow-sm h-[177] flex flex-col justify-center">
                <h3 className="text-md font-semibold text-gray-900 mb-2">
                  Items Total Weight
                </h3>
                <p className="text-3xl font-medium text-blue-700">
                  {form.values.enqDetails
                    .reduce(
                      (total, item) =>
                        total + (item.actWeight || 0) * (item.quantity || 1),
                      0
                    )
                    .toFixed(2)}{" "}
                  kg
                </p>
              </div>
            </div>

            {/* Right Column - Special Requirements and Submit Button */}
            <div className="lg:col-span-3">
              <div className=" border bg-white border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Special Requirements
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Please specify any special requirements for this shipment.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Checkbox
                    label="This Shipment Contains Dangerous Goods (DG)"
                    {...form.getInputProps("isDangerous", { type: "checkbox" })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 pt-5 gap-4">
                  <Checkbox
                    label="Item(s) are Non-Stackable"
                    {...form.getInputProps("isNonStackable", {
                      type: "checkbox",
                    })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={isPending}
                  className="h-12 bg-blue-600 hover:bg-blue-700 transition-colors w-full md:w-auto px-8"
                  size="lg"
                >
                  Get Your Quote
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Modal
        opened={opened}
        onClose={close}
        title="Success"
        centered
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <div className="flex flex-col items-center py-4">
          <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-center text-gray-700 text-lg font-medium mb-2">
            Quote requested successfully.
          </p>
          <p className="text-center text-gray-500 text-sm mb-6">
            Your quote is being processed and will be available shortly.
          </p>

          <div className="flex justify-end w-full">
            <Button
              h={"2.7rem"}
              onClick={() => router.push("/my-quotes")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              View My Quotes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuoteForm;
