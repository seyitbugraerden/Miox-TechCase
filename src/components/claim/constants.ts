import {
  AlertTriangle,
  LayoutDashboard,
  Paperclip,
  Search,
  ShieldCheck,
  StickyNote,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { FileSearch } from 'lucide-react'

import type { AddNodeValues, DocumentAnalyzerValues } from '@/types'

export type StepRegistryEntry = {
  icon: LucideIcon
  stage: string
  fields: Array<{ key: string; label: string }>
  tone: string
}

export const stepRegistry: Record<string, StepRegistryEntry> = {
  'Towing Service': {
    icon: LayoutDashboard,
    stage: 'Field service',
    tone: 'from-amber-500/15 via-background to-background',
    fields: [
      { key: 'pickupLocation', label: 'Pickup Location' },
      { key: 'towingDate', label: 'Towing Date' },
    ],
  },
  'Claim Notification': {
    icon: FileSearch,
    stage: 'Intake',
    tone: 'from-blue-500/15 via-background to-background',
    fields: [
      { key: 'dateTime', label: 'Registered At' },
      { key: 'reportType', label: 'Report Type' },
      { key: 'reasonForDamage', label: 'Damage Reason' },
      { key: 'reportingParty', label: 'Reporting Party' },
      { key: 'contact', label: 'Contact' },
    ],
  },
  Appraisal: {
    icon: ShieldCheck,
    stage: 'Assessment',
    tone: 'from-cyan-500/15 via-background to-background',
    fields: [
      { key: 'expertAssignmentDate', label: 'Assignment Date' },
      { key: 'expertInfo', label: 'Expert Info' },
      { key: 'contact', label: 'Contact' },
    ],
  },
  'Substitute Rental Vehicle': {
    icon: LayoutDashboard,
    stage: 'Support benefit',
    tone: 'from-emerald-500/15 via-background to-background',
    fields: [
      { key: 'vehicleDuration', label: 'Vehicle Duration' },
      { key: 'vehicleModel', label: 'Vehicle Model' },
      { key: 'extraDuration', label: 'Extra Duration' },
    ],
  },
  'File Review': {
    icon: Search,
    stage: 'Review',
    tone: 'from-orange-500/15 via-background to-background',
    fields: [
      { key: 'reviewReferralDate', label: 'Referral Date' },
      { key: 'reviewCompletionDate', label: 'Completion Target' },
    ],
  },
  'Deduction Reason': {
    icon: AlertTriangle,
    stage: 'Action required',
    tone: 'from-rose-500/15 via-background to-background',
    fields: [
      { key: 'actionRequired', label: 'Action Required' },
      { key: 'occupationalDeduction', label: 'Occupational Deduction' },
      { key: 'appreciationDeduction', label: 'Appreciation Deduction' },
      { key: 'policyDeductible', label: 'Policy Deductible' },
      { key: 'nonDamageAmount', label: 'Non-damage Amount' },
    ],
  },
  'Payment Information': {
    icon: Wallet,
    stage: 'Finance',
    tone: 'from-violet-500/15 via-background to-background',
    fields: [
      { key: 'paidTo', label: 'Paid To' },
      { key: 'iban', label: 'IBAN' },
      { key: 'paymentAmount', label: 'Payment Amount' },
      { key: 'note', label: 'Note' },
    ],
  },
  Closed: {
    icon: ShieldCheck,
    stage: 'Completion',
    tone: 'from-slate-500/15 via-background to-background',
    fields: [{ key: 'completionDate', label: 'Completion Date' }],
  },
  'Information Note': {
    icon: StickyNote,
    stage: 'User note',
    tone: 'from-sky-500/15 via-background to-background',
    fields: [
      { key: 'message', label: 'Message' },
      { key: 'emphasis', label: 'Priority' },
      { key: 'createdAt', label: 'Created At' },
    ],
  },
  'Additional Attachment': {
    icon: Paperclip,
    stage: 'User attachment',
    tone: 'from-fuchsia-500/15 via-background to-background',
    fields: [
      { key: 'fileName', label: 'Attachment Name' },
      { key: 'note', label: 'Review Note' },
      { key: 'reviewStatus', label: 'Review Status' },
      { key: 'uploadedAt', label: 'Uploaded At' },
    ],
  },
}

export const defaultAddNodeValues: AddNodeValues = {
  type: 'note',
  message: '',
  emphasis: 'FYI',
}

export const defaultAnalyzerValues: DocumentAnalyzerValues = {
  documentType: 'Occupational Certificate',
  note: '',
}
