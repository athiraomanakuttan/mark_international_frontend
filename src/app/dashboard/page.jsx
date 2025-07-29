
'use client'
import {useAppSelector} from '../../lib/redux/hook'

const DashboardComponent = () => {
  const user = useAppSelector((state) => state.user)
  console.log("user",user)
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Add your dashboard content here */}
    </div>
  );
}

export default DashboardComponent;