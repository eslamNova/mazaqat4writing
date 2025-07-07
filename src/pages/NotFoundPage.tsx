import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">الصفحة غير موجودة</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها أو حذفها.
      </p>
      
      <Link to="/">
        <Button className="flex items-center gap-2">
          <Home size={18} />
          <span>العودة إلى الصفحة الرئيسية</span>
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;