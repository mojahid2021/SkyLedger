#!/bin/bash
sed -i 's/import {.*} from "@phosphor-icons\/react"/import { ArrowLeft, Save, Trash2, Mail, Phone, CalendarCheck, Coins, Plane, ShieldAlert, User as UserIcon, XCircle, CheckCircle, ClockCounterClockwise, ShieldCheck, UserCircle } from "@phosphor-icons\/react"/g' src/app/admin/users/[id]/page.tsx
