"use client"

import { MapPin } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getDepartmentsGrouped, getDistrictsForDepartment } from "@/lib/paraguay-departments"

type Props = {
  departmentKey: string
  district: string
  onDepartmentKeyChange: (key: string) => void
  onDistrictChange: (district: string) => void
  labelClassName?: string
  departmentTriggerClassName?: string
  districtTriggerClassName?: string
  wrapClassName?: string
  groupByRegion?: boolean
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
  groupByRegion = true,
}: Props) {
  const districts = departmentKey ? getDistrictsForDepartment(departmentKey) : []
  const grouped = getDepartmentsGrouped()

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
          <SelectContent className="max-h-[min(24rem,70vh)]">
            <SelectItem value="all">Todos los departamentos</SelectItem>
            {groupByRegion
              ? grouped.map((g) => (
                  <SelectGroup key={g.label}>
                    <SelectLabel className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/90">
                      {g.label}
                    </SelectLabel>
                    {g.items.map((d) => (
                      <SelectItem key={d.key} value={d.key}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))
              : grouped.flatMap((g) => g.items).map((d) => (
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
          <SelectContent className="max-h-[min(24rem,70vh)]">
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
