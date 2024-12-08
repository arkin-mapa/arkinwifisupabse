import { Store, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./button";

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-emerald-600">
          WiFi Voucher Store
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <Link to="/client">
            <Button variant="ghost" size="sm" className="gap-2">
              <Store className="h-4 w-4" />
              Switch to Store
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Admin Dashboard
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}