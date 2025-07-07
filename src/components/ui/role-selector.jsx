'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getAvailableRoles, getRoleLabel, getRoleIcon } from '@/lib/roles';
import RoleBadge from './role-badge';

export default function RoleSelector({ 
  currentRole, 
  onRoleSelect, 
  trigger,
  disabled = false,
  excludeRoles = [] // Roles to exclude from selection
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const availableRoles = getAvailableRoles().filter(
    role => !excludeRoles.includes(role.value)
  );

  const handleRoleSelect = (roleValue) => {
    setSelectedRole(roleValue);
  };

  const handleSave = () => {
    onRoleSelect(selectedRole);
    setIsOpen(false);
  };

  const handleDialogOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      setSelectedRole(currentRole);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" disabled={disabled}>
            Change Role
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Role</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Selection */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Current Selection:</p>
            <RoleBadge role={selectedRole} size="lg" />
          </div>

          {/* Role Options */}
          <div className="grid gap-3">
            {availableRoles.map((role) => (
              <Card 
                key={role.value}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedRole === role.value 
                    ? 'ring-2 ring-primary bg-accent' 
                    : ''
                }`}
                onClick={() => handleRoleSelect(role.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{role.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium">{role.label}</h3>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    {selectedRole === role.value && (
                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!selectedRole || selectedRole === currentRole}
            >
              Update Role
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
