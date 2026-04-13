"use client"

import { MapPin } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PARAGUAY_DEPARTMENTS, getDistrictsForDepartment } from "@/lib/paraguay-departments"

type Props = {
  departmentKey: string
  district: string
  onDepartmentKeyChange: (key: string) => void
  onDistrictChange: (district: string) => void
  labelClassName?: string
  departmentTriggerClassName?: string
  districtTriggerClassName?: string
  wrapClassName?: string
}

export function DepartmentDistrictFilters({
  departmentKey,
  district,
  onDepartmentKeyChange,
  onDistrictChange,
  labelClassName = "text-xs font-medium text-muted-foreground flex items-center gap-1.5",
  departmentTriggerClassName = "w-full min-w-0 md:w-[200px] h-9 text-sm",
  districtTriggerClassName = "w-full min-w-0 md:w-[220px] h-9 text-sm",
  wrapClassName = "flex flex-col gap-1.5 w-full md:w-auto",
}: Props) {
  const districts = departmentKey ? getDistrictsForDepartment(departmentKey) : []

  return (
    <>
      <div className={wrapClassName}>
        <Label className={labelClassName}>
          <MapPin className="h-3.5 w-3.5" />
          Departamento
        </Label>
        <Select
          value={departmentKey || "all"}
          onValueChange={(v) => {
            const k = v === "all" ? "" : v
            onDepartmentKeyChange(k)
            onDistrictChange("")
          }}
        >
          <SelectTrigger className={departmentTriggerClassName}>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los departamentos</SelectItem>
            {PARAGUAY_DEPARTMENTS.map((d) => (
              <SelectItem key={d.key} value={d.key}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className={wrapClassName}>
        <Label className={labelClassName}>
          <MapPin className="h-3.5 w-3.5" />
          Distrito
        </Label>
        <Select
          value={!departmentKey ? "all" : district || "all"}
          onValueChange={(v) => onDistrictChange(v === "all" ? "" : v)}
          disabled={!departmentKey}
        >
          <SelectTrigger className={districtTriggerClassName} disabled={!departmentKey}>
            <SelectValue placeholder={departmentKey ? "Elegí un distrito" : "Primero el departamento"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los distritos</SelectItem>
            {districts.map((name) => (
              <SelectItem key={`${departmentKey}-${name}`} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
