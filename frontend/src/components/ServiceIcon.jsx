import React from 'react';
import {
  Home, Wrench, Zap, Hammer, Paintbrush, Sparkles, Bug,
  Wind, Refrigerator, WashingMachine, Droplets,
  Smartphone, Laptop, Camera, Monitor,
  Bike, Car, Truck,
  Scissors, Dumbbell, Palette,
  GraduationCap, Package, Calendar,
  User, MapPin, Settings, HelpCircle
} from 'lucide-react';

const iconMap = {
  Home,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  Bug,
  Wind,
  Refrigerator,
  WashingMachine,
  Droplets,
  Smartphone,
  Laptop,
  Camera,
  Monitor,
  Bike,
  Car,
  Truck,
  Scissors,
  Dumbbell,
  Palette,
  GraduationCap,
  Package,
  Calendar,
  User,
  MapPin,
  Settings,
  HelpCircle
};

const ServiceIcon = ({ name, className = "w-6 h-6", ...props }) => {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent className={className} strokeWidth={1.5} {...props} />;
};

export default ServiceIcon;
