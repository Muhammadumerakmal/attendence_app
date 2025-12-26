import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import supabase from '../../configdb/supabase';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: any) => {
    setLoading(true);
    const { email, password } = values;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      message.error(error.message);
    } else {
      message.success('Login successful');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800 px-4">
      <Card
        bordered={false}
        className="
          w-full max-w-md
          rounded-2xl
          shadow-[0_20px_40px_rgba(0,0,0,0.08)]
          dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]
          bg-white dark:bg-slate-900
          transition-all duration-300
          animate-[fadeIn_0.4s_ease-out]
        "
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="
              mx-auto mb-4
              h-12 w-12
              rounded-xl
              flex items-center justify-center
              bg-gradient-to-br from-indigo-600 to-blue-600
              shadow-md
            "
          >
            <LoginOutlined className="text-white text-lg" />
          </div>

          <Title level={3} className="!mb-1 text-slate-800 dark:text-slate-100">
            Sign in
          </Title>
          <Text className="text-slate-500 dark:text-slate-400">
            Access your account securely
          </Text>
        </div>

        {/* Form */}
        <Form
          layout="vertical"
          size="large"
          onFinish={handleLogin}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-slate-400" />}
              placeholder="you@example.com"
              className="
                rounded-lg
                transition-all duration-200
                focus:shadow-[0_0_0_2px_rgba(99,102,241,0.25)]
              "
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="Enter your password"
              className="
                rounded-lg
                transition-all duration-200
                focus:shadow-[0_0_0_2px_rgba(99,102,241,0.25)]
              "
            />
          </Form.Item>

          {/* Helper Row */}
          <div className="flex justify-between items-center mb-6">
            <Text className="text-sm text-slate-500 dark:text-slate-400">
              Secure login enabled
            </Text>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Button */}
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="
              h-11
              rounded-lg
              bg-gradient-to-r from-indigo-600 to-blue-600
              hover:from-indigo-700 hover:to-blue-700
              border-none
              shadow-md
              hover:shadow-lg
              transition-all duration-200
              active:scale-[0.99]
            "
          >
            Sign In
          </Button>

          {/* Footer */}
          <div className="text-center mt-6">
            <Text className="text-slate-600 dark:text-slate-400">
              Don’t have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Create one
              </Link>
            </Text>
          </div>
        </Form>
      </Card>

      {/* Animation */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.96);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}
