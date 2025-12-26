import { useEffect, useState } from "react";
import supabase from "../configdb/supabase";
import { 
  Layout, 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Tabs,
  Avatar,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
  Statistic,
  Empty
} from "antd";
import { 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleFilled,
  CalendarOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  LogoutOutlined,
  UserOutlined // Added UserOutlined for placeholder
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

// --- COMPONENT NAME CHANGE ---
const { Header, Content } = Layout;
const { Title, Text } = Typography;

// --- Types ---
type Student = {
  id: number;
  name: string;
  roll_num: string;
  status: string;
  created_at: string;
};

type AttendanceRecord = {
  id: number;
  student_id: number;
  date: string;
  status: string;
};

// --- RENAMED COMPONENT ---
export default function AttendanceManager() {
  // --- State Management (Unchanged) ---
  const [students, setStudents] = useState<Student[]>([]);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const today = dayjs().format('YYYY-MM-DD');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [rollInput, setRollInput] = useState("");
  const navigate = useNavigate();

  // --- Data Fetching (Unchanged) ---
  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("studentsTable")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setStudents(data);
    if (error) message.error("Failed to load students");
    setLoading(false);
  };

  const fetchAttendance = async (date: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Attendence")
      .select("*")
      .eq("date", date);

    if (data) setAttendanceRecords(data);
    if (error) message.error("Failed to load attendance");
    setLoading(false);
  };

  const handleLogout = async () => {
      const { error } = await supabase.auth.signOut();
      if (!error) {
          navigate('/login');
      }
  };

  // --- Effects (Unchanged) ---
  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchAttendance(today);
  }, []);

  // --- Handlers (Unchanged) ---
  const handleSubmit = async (values: any) => {
    setLoading(true);
    let error;
    
    if (editingId) {
      const result = await supabase.from("studentsTable").update(values).eq("id", editingId);
      error = result.error;
      if (!error) {
        message.success("Student updated successfully.");
        setEditingId(null);
      }
    } else {
      const result = await supabase.from("studentsTable").insert([{ ...values, created_at: new Date().toISOString() }]);
      error = result.error;
      if (!error) {
        message.success("New student added.");
      }
    }

    if (error) message.error(error.message);
    else {
      form.resetFields();
      fetchStudents();
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    const { error } = await supabase.from("studentsTable").delete().eq("id", id);
    if (!error) {
      message.success("Student record deleted");
      fetchStudents();
    } else {
      message.error(error.message);
    }
    setLoading(false);
  };

  const markAttendance = async (studentId: number, status: string) => {
    const { data: existing } = await supabase
      .from("Attendence")
      .select("id")
      .eq("student_id", studentId)
      .eq("date", today)
      .single();

    let error;
    if (existing) {
      const result = await supabase.from("Attendence").update({ status }).eq("id", existing.id);
      error = result.error;
    } else {
      const result = await supabase.from("Attendence").insert([{ student_id: studentId, date: today, status }]);
      error = result.error;
    }

    if (!error) {
      fetchAttendance(today);
      return true;
    } else {
      message.error("Could not update attendance");
      return false;
    }
  };

  const handleRollSubmit = async () => {
    if (!rollInput.trim()) return;
    
    const student = students.find(s => s.roll_num.toLowerCase() === rollInput.trim().toLowerCase());
    
    if (student) {
      if (student.status !== 'active') {
        message.warning(`Student ${student.name} is inactive and cannot be marked.`);
        return;
      }
      
      const success = await markAttendance(student.id, 'present');
      if (success) {
        message.success(`Marked PRESENT: ${student.name}`);
        setRollInput("");
      }
    } else {
      message.error(`Roll number "${rollInput}" not found`);
    }
  };

  // --- Logic Helpers (Unchanged) ---
  const getAttendanceStatus = (studentId: number) => {
    const record = attendanceRecords.find(r => r.student_id === studentId);
    return record ? record.status : "pending";
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_num.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Columns Config ---
  const studentColumns = [
    {
      title: 'NAME',
      dataIndex: 'name',
      render: (name: string, record: Student) => (
        <Space size="middle">
          {/* Avatar style updated */}
          <Avatar 
            style={{ backgroundColor: '#4f46e520', color: '#4f46e5', fontWeight: 600 }} 
            size="large"
            icon={!getInitials(name) ? <UserOutlined /> : undefined}
          >
            {getInitials(name)}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700 text-[15px]">{name}</span>
            <span className="text-xs text-slate-400 font-mono">{record.roll_num}</span>
          </div>
        </Space>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => (
        // Tag style updated for a more modern, pill-shaped look
        <Tag 
          color={status === 'active' ? 'success' : 'default'} 
          style={{ borderRadius: 999, border: 'none', background: status === 'active' ? '#dcfce7' : '#f3f4f6', color: status === 'active' ? '#16a34a' : '#6b7280', fontWeight: 600, padding: '4px 10px' }}
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 150,
      align: 'right' as const,
      render: (_: any, record: Student) => (
        <Space size="small">
          {/* Edit Button Style Update */}
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            className="text-slate-500 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-colors"
            onClick={() => {
              setEditingId(record.id);
              form.setFieldsValue(record);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          {/* Delete Popconfirm (Unchanged) */}
          <Popconfirm
            title="Delete student?"
            description="Are you sure you want to remove this record permanently?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="text-slate-500 hover:text-rose-600 p-2 rounded-full hover:bg-rose-50 transition-colors" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const attendanceColumns = [
    {
      title: 'STUDENT',
      dataIndex: 'name',
      render: (name: string, record: Student) => (
        <Space size="middle">
          <Avatar 
            style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 600 }} 
            icon={!getInitials(name) ? <UserOutlined /> : undefined}
          >
            {getInitials(name)}
          </Avatar>
          <span className="font-medium text-slate-700">{name}</span>
           <Text type="secondary" className="text-xs">({record.roll_num})</Text> {/* Added roll num for quick identification */}
        </Space>
      ),
    },
    {
      title: 'ATTENDANCE',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: Student) => {
        const status = getAttendanceStatus(record.id);
        const isPresent = status === 'present';
        const isAbsent = status === 'absent';
        const isLate = status === 'late';
        const isPending = status === 'pending'; // Added pending state

        return (
          <div className="flex justify-end gap-2">
            {/* Present Button */}
            <Button
              className={`min-w-[40px] border transition-all ${isPresent ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 border-slate-200'}`}
              icon={<CheckCircleFilled />}
              onClick={() => markAttendance(record.id, 'present')}
              shape="default"
              size="middle"
            >
              <span className="hidden sm:inline">Present</span>
            </Button>
            
            {/* Absent Button */}
            <Button
              className={`min-w-[40px] border transition-all ${isAbsent ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-500 border-slate-200'}`}
              icon={<CloseCircleFilled />}
              onClick={() => markAttendance(record.id, 'absent')}
              shape="default"
              size="middle"
            >
               <span className="hidden sm:inline">Absent</span>
            </Button>

            {/* Late Button */}
            <Button
              className={`min-w-[40px] border transition-all ${isLate ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-white text-slate-400 hover:bg-amber-50 hover:text-amber-500 border-slate-200'}`}
              icon={<ClockCircleFilled />}
              onClick={() => markAttendance(record.id, 'late')}
              shape="default"
              size="middle"
            >
               <span className="hidden sm:inline">Late</span>
            </Button>
            
            {/* Pending Tag */}
            {isPending && (
                <Tag color="blue" className="!bg-blue-50 !text-blue-600 !border-blue-200 font-semibold !rounded-full py-1 px-3 self-center">PENDING</Tag>
            )}
          </div>
        );
      },
    },
  ];

  // --- Render ---
  return (
    <Layout className="min-h-screen bg-slate-100"> {/* Softened background */}
      <Header className="bg-white sticky top-0 z-50 px-6 h-16 flex items-center justify-between border-b border-slate-200 shadow-md">
        <div className="flex items-center gap-3">
          {/* Refined Branding */}
          <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-300">
            <CheckSquareOutlined className="text-lg" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-800">
            Attendance<span className="text-indigo-600 font-medium">Pilot</span> {/* New Name */}
          </span>
        </div>
        <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            className="text-slate-500 hover:text-rose-500 font-medium"
        >
            Logout
        </Button>
      </Header>

      <Content className="max-w-7xl mx-auto w-full p-4 sm:p-8"> {/* Wider content area */}
        <Tabs
          defaultActiveKey="attendance" // Changed default tab to Attendance for immediate action
          className="custom-tabs"
          size="large"
          items={[
            {
              key: 'attendance',
              label: (<span className="flex items-center gap-1 font-semibold text-base"><CalendarOutlined /> Daily Attendance</span>),
              children: (
                <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                  {/* Attendance Header Card */}
                  <Card bordered={false} className="shadow-xl rounded-xl bg-white/80 backdrop-blur-sm border-2 border-indigo-50/50">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <ClockCircleFilled style={{ fontSize: 24 }} />
                        </div>
                        <div>
                          <Text className="block text-slate-500 text-xs font-semibold uppercase tracking-wider">Today's Date</Text>
                          <Title level={3} style={{ margin: 0, color: '#1e293b' }}>
                            {dayjs().format('dddd, MMMM D, YYYY')}
                          </Title>
                        </div>
                      </div>
                      
                      {/* Roll Number Input */}
                      <div className="w-full md:w-auto min-w-[300px]">
                          <Input.Search
                            placeholder="Scan or Enter Roll Number..."
                            enterButton="Mark Present"
                            size="large"
                            value={rollInput}
                            onChange={e => setRollInput(e.target.value)}
                            onSearch={handleRollSubmit}
                            loading={loading} // Added loading to the button
                            className="[&>span>button]:!bg-indigo-600 [&>span>button]:hover:!bg-indigo-700"
                          />
                      </div>
                    </div>
                  </Card>

                  {/* Attendance Table */}
                  <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center">
                      <Title level={5} style={{ margin: 0, fontWeight: 700 }}>Active Student Attendance Sheet</Title>
                      <Tag className="m-0 bg-slate-100 text-slate-600 border-0 font-medium py-1 px-3">
                          {students.filter(s => s.status === 'active').length} Active Students
                      </Tag>
                    </div>
                    
                    <Table
                      columns={attendanceColumns}
                      dataSource={students.filter(s => s.status === 'active')}
                      rowKey="id"
                      loading={loading}
                      pagination={{ pageSize: 10 }} // Added pagination
                      rowClassName={(record) => {
                          const status = getAttendanceStatus(record.id);
                          if (status === 'absent') return 'bg-rose-50/50 hover:!bg-rose-100';
                          if (status === 'present') return 'bg-emerald-50/50 hover:!bg-emerald-100';
                          if (status === 'late') return 'bg-amber-50/50 hover:!bg-amber-100';
                          return 'hover:bg-slate-50';
                      }}
                      locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No active students for today" /> }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'students',
              label: (<span className="flex items-center gap-1 font-semibold text-base"><TeamOutlined /> Manage Students</span>),
              children: (
                <div className="animate-fade-in space-y-8">
                  {/* Summary Cards (Unchanged) */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Card bordered={false} className="shadow-lg rounded-xl">
                        <Statistic 
                          title={<span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Total Students</span>}
                          value={students.length}
                          valueStyle={{ fontWeight: 700, color: '#1e293b' }} 
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card bordered={false} className="shadow-lg rounded-xl">
                        <Statistic 
                          title={<span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Active</span>}
                          value={students.filter(s => s.status === 'active').length}
                          valueStyle={{ fontWeight: 700, color: '#16a34a' }} 
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                       <Card bordered={false} className="shadow-lg rounded-xl">
                        <Statistic 
                          title={<span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Inactive</span>}
                          value={students.filter(s => s.status !== 'active').length}
                          valueStyle={{ fontWeight: 700, color: '#94a3b8' }} 
                        />
                      </Card>
                    </Col>
                  </Row>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                      <div className="sticky top-24">
                        <Card 
                          title={editingId ? "Edit Student Details" : "Register New Student"} 
                          bordered={false} 
                          className="shadow-xl rounded-xl"
                        >
                          <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            initialValues={{ status: 'active' }}
                            requiredMark={false}
                          >
                            <Form.Item
                              label="Full Name"
                              name="name"
                              rules={[{ required: true, message: 'Full name is required' }]}
                              className="mb-4"
                            >
                              <Input placeholder="e.g. Jane Smith" size="large" />
                            </Form.Item>

                            <Form.Item
                              label="Roll / ID Number"
                              name="roll_num"
                              rules={[{ required: true, message: 'Roll/ID number is required' }]}
                              className="mb-4"
                            >
                              <Input placeholder="e.g. 2024-001" size="large" />
                            </Form.Item>

                            <Form.Item label="Status" name="status" className="mb-6">
                              <Select size="large">
                                <Select.Option value="active">Active</Select.Option>
                                <Select.Option value="inactive">Inactive</Select.Option>
                              </Select>
                            </Form.Item>

                            <div className="flex gap-2 pt-2">
                              <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading} 
                                block 
                                size="large"
                                icon={editingId ? <EditOutlined /> : <PlusOutlined />}
                                className="!bg-indigo-600 hover:!bg-indigo-700"
                              >
                                {editingId ? 'Save Changes' : 'Add Student'}
                              </Button>
                              {editingId && (
                                <Button 
                                  onClick={() => { setEditingId(null); form.resetFields(); }}
                                  size="large"
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </Form>
                        </Card>
                      </div>
                    </div>

                    {/* Table Section */}
                    <div className="lg:col-span-2 space-y-4">
                      <Input 
                        prefix={<SearchOutlined className="text-slate-400" />} 
                        placeholder="Search students by name or roll number..." 
                        className="!bg-white !rounded-xl !shadow-sm !border-slate-200 py-2 px-4" 
                        onChange={e => setSearchTerm(e.target.value)}
                        allowClear
                      />
                      
                      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                        <Table
                          columns={studentColumns}
                          dataSource={filteredStudents}
                          rowKey="id"
                          loading={loading}
                          pagination={{ pageSize: 10 }}
                          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No students found" /> }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Content>
    </Layout>
  );
}