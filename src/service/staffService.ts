import { StaffType } from '@/types/formTypes';
import axiosInstance from './axiosInstance';
import { BASICRESPONSE } from '../constance/BasicResponseType';

export const registerNewStaff = async (data: StaffType) => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('password', data.password);
    formData.append('designation', data.designation);
    formData.append('accessOfficialWhatsapp', String(data.accessOfficialWhatsapp));
    formData.append('accessPhoneCallLog', String(data.accessPhoneCallLog));

    if (data.email) formData.append('email', data.email);
    if (data.accessibleUsers) formData.append('accessibleUsers', data.accessibleUsers);
    if (data.openingBalance) formData.append('openingBalance', data.openingBalance);
    if (data.staffImage) formData.append('staffImage', data.staffImage);

    const response = await axiosInstance.post('/admin/staff/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error registering staff:', error);
    return BASICRESPONSE;
  }
};

