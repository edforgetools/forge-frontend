import * as React from "react";
import { Checkbox } from "./checkbox";
import { Button } from "./button";

/**
 * Example usage of the Checkbox component
 * This file demonstrates various ways to use the Checkbox component
 * and can be removed in production
 */
export function CheckboxExamples() {
  const [checked, setChecked] = React.useState(false);
  const [indeterminate, setIndeterminate] = React.useState(false);

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Checkbox Examples</h2>

      {/* Basic usage */}
      <div className="space-y-2">
        <h3 className="font-medium">Basic Usage</h3>
        <div className="flex items-center space-x-2">
          <Checkbox id="basic" />
          <label htmlFor="basic" className="text-sm font-medium">
            Basic checkbox
          </label>
        </div>
      </div>

      {/* Controlled */}
      <div className="space-y-2">
        <h3 className="font-medium">Controlled</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="controlled"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <label htmlFor="controlled" className="text-sm font-medium">
            Controlled checkbox: {checked ? "checked" : "unchecked"}
          </label>
        </div>
      </div>

      {/* Indeterminate */}
      <div className="space-y-2">
        <h3 className="font-medium">Indeterminate</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="indeterminate"
            indeterminate={indeterminate}
            checked={indeterminate ? false : checked}
            onCheckedChange={setChecked}
          />
          <label htmlFor="indeterminate" className="text-sm font-medium">
            Indeterminate checkbox
          </label>
          <button
            onClick={() => setIndeterminate(!indeterminate)}
            className="text-xs bg-gray-200 px-2 py-1 rounded"
          >
            Toggle indeterminate
          </button>
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-2">
        <h3 className="font-medium">Variants</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="default" variant="default" />
            <label htmlFor="default" className="text-sm">
              Default
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="destructive" variant="destructive" />
            <label htmlFor="destructive" className="text-sm">
              Destructive
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="outline" variant="outline" />
            <label htmlFor="outline" className="text-sm">
              Outline
            </label>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <h3 className="font-medium">Sizes</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="sm" size="sm" />
            <label htmlFor="sm" className="text-sm">
              Small
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="default-size" size="default" />
            <label htmlFor="default-size" className="text-sm">
              Default
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="lg" size="lg" />
            <label htmlFor="lg" className="text-sm">
              Large
            </label>
          </div>
        </div>
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <h3 className="font-medium">Disabled States</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="disabled-unchecked" disabled />
            <label
              htmlFor="disabled-unchecked"
              className="text-sm text-gray-500"
            >
              Disabled unchecked
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="disabled-checked" disabled defaultChecked />
            <label htmlFor="disabled-checked" className="text-sm text-gray-500">
              Disabled checked
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="disabled-indeterminate" disabled indeterminate />
            <label
              htmlFor="disabled-indeterminate"
              className="text-sm text-gray-500"
            >
              Disabled indeterminate
            </label>
          </div>
        </div>
      </div>

      {/* Form integration */}
      <div className="space-y-2">
        <h3 className="font-medium">Form Integration</h3>
        <form className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="required" name="terms" value="accepted" required />
            <label htmlFor="required" className="text-sm font-medium">
              I accept the terms and conditions *
            </label>
          </div>
          <Button type="submit" size="sm">
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}
