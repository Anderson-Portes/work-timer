"use client";

import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <Button
      variant="destructive"
      className="absolute top-4 right-4"
      onClick={() => signOut()}
    >
      <LogOut className="w-5 h-5 mr-2" /> Sair
    </Button>
  );
}
