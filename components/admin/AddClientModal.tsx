"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import {
  registerClientSchema,
  type RegisterClientFormData,
} from "@/lib/validations/schema";
import { FormInput } from "@/components/ui/form-input";
import { FormButton } from "@/components/ui/form-button";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { toastError, toastSuccess } from "@/lib/utils/toast";
import { API_ADMIN_USERS_ENDPOINT } from "@/lib/utils/constants";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddClientModal({
  isOpen,
  onClose,
  onSuccess,
}: AddClientModalProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterClientFormData>({
    resolver: zodResolver(registerClientSchema),
    defaultValues: {
      username: "",
      password: "",
      displayText: "",
    },
  });

  const handleClose = () => {
    reset();
    setLogoPreview(null);
    setLogoFile(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toastError("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toastError("Image size should be less than 5MB");
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    const fileInput = document.getElementById(
      "logo-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (data: RegisterClientFormData) => {
    setIsSubmitting(true);
    try {
      // Create FormData instead of JSON
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("password", data.password);
      if (data.displayText) {
        formData.append("displayname", data.displayText);
      }

      // Append file if selected
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      // Send FormData to API
      const response = await apiClient.post<any>(
        API_ADMIN_USERS_ENDPOINT,
        formData
      );

      if (response.success) {
        toastSuccess("Client created successfully!");
        handleClose();
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating client:", error);
      toastError(error.message || "Failed to create client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open: boolean) => !open && handleClose()}
    >
      <Dialog.Portal>
        {/* Backdrop - Optional, can customize */}
        {/* <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-20 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" /> */}

        {/* Side Panel */}
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div>
                <Dialog.Title className="text-2xl font-bold text-gray-800">
                  Add New Client
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500 mt-1">
                  Fill in the details to create a new client account
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition"
                  disabled={isSubmitting}
                >
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                <FormInput
                  label="Email Address"
                  type="email"
                  register={register("username")}
                  error={errors.username}
                  placeholder="client@example.com"
                  disabled={isSubmitting}
                  required
                />

                <FormInput
                  label="Password"
                  type="password"
                  register={register("password")}
                  error={errors.password}
                  placeholder="Enter password"
                  disabled={isSubmitting}
                  required
                  helperText="6-12 characters"
                />

                <FormInput
                  label="Display Name"
                  type="text"
                  register={register("displayText")}
                  error={errors.displayText}
                  placeholder="ABC Lottery Shop"
                  disabled={isSubmitting}
                  helperText="Optional: Custom name for the client"
                />

                {/* Logo Upload */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Logo
                    <span className="text-gray-400 text-xs ml-1 font-normal">
                      (Optional)
                    </span>
                  </label>

                  <div className="space-y-3">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="logo-upload"
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor="logo-upload"
                        className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition ${
                          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <Upload size={18} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Click to upload logo
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-1">
                        Max 5MB • JPG, PNG, GIF
                      </p>
                    </div>

                    {logoPreview && (
                      <div className="relative w-full border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-20 h-20 border rounded-md overflow-hidden bg-white">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">
                              {logoFile?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(logoFile?.size || 0) / 1024} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                            disabled={isSubmitting}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    )}

                    {!logoPreview && (
                      <div className="w-full border border-gray-200 rounded-lg bg-gray-50 p-8 flex flex-col items-center justify-center">
                        <ImageIcon className="text-gray-300 mb-2" size={40} />
                        <p className="text-sm text-gray-400">
                          No logo selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Fixed Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <FormButton
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </FormButton>
                </Dialog.Close>
                <FormButton
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  className="flex-1"
                >
                  Create Client
                </FormButton>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
