'use client'
import { StaffType } from '@/types/formTypes';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import {useFetchFormData} from '@/hook/FormHook'
 

const RegistrationPage: React.FC = () => {
    const {formData,setForm} =  useFetchFormData<StaffType>()
    const [staffFormData, setStaffFormData] = useState<StaffType>()
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setStaffFormData(({
      ...formData,
      staffImage: file
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log('Form submitted:', staffFormData);
    // Handle form submission here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">ADD STAFF</h1>
          <div className="flex items-center text-sm text-gray-500">
            <span>Staff Management</span>
            <span className="mx-2">›</span>
            <span>Add Staff</span>
          </div>
        </div>

        {/* Form */}
        <div className="p-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e)=>setForm("name",e.target.value)}
                placeholder="Enter Full Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number<span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <div className="flex items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50">
                  <span className="text-sm text-gray-600">📞 +44</span>
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e)=>setForm("phoneNumber",e.target.value)}
                  placeholder="Enter Phone Number"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                 onChange={(e)=>setForm("password",e.target.value)}
                placeholder="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Designation Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation<span className="text-red-500">*</span>
              </label>
              <select
                name="designation"
                value={formData.designation}
                onChange={(e)=>setForm("designation",e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select</option>
                <option value="manager">Manager</option>
                <option value="supervisor">Supervisor</option>
                <option value="staff">Staff</option>
                <option value="assistant">Assistant</option>
              </select>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Id
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e)=>setForm("email",e.target.value)}
                placeholder="Enter Your Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Staff Image Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staff Image
              </label>
              <div className="flex">
                <label className="flex items-center px-4 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 cursor-pointer hover:bg-gray-100">
                  <span className="text-sm text-gray-600">Choose File</span>
                  <input
                    type="file"
                    name="staffImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                <div className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 text-sm text-gray-500">
                  {formData.staffImage ? formData.staffImage.name : 'No file chosen'}
                </div>
              </div>
            </div>

            {/* Accessible Users Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accessible Users
              </label>
              <select
                name="accessibleUsers"
                value={formData.accessibleUsers}
                onChange={(e)=>setForm("accessibleUsers",e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="all">All Users</option>
                <option value="department">Department Only</option>
                <option value="specific">Specific Users</option>
              </select>
            </div>

            {/* Opening Balance Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Balance
              </label>
              <input
                type="number"
                name="openingBalance"
                value={formData.openingBalance}
                onChange={(e)=>setForm("openingBalance",e.target.value)}
                placeholder="Enter Opening balance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>


          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any)}
              className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default RegistrationPage;