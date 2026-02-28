import { useState, useMemo, useEffect } from "react";
import api from "@/services/api";
import FeeExplore from "./FeeExplore"; 
/*
=====================================================
SCHOOL FEE STRUCTURE — FINAL CORRECT VERSION
• STOP-wise entry allowed
• STOP-wise total NOT added in summary
• Monthly + Annual summary
• Component-wise breakdown
=====================================================
*/

export default function FeeStructure() {
  const [mode, setMode] = useState("class");
const [sections, setSections] = useState([]);

  /* ================= STRUCTURE METADATA ================= */
  const [basicInfo, setBasicInfo] = useState({
  session: "",
  className: "",
  section:"",
    classId: "",
  structureName: "",
});


  /* ================= FEE COMPONENTS ================= */
  const [components, setComponents] = useState([
    {
      name: "Tuition Fee",
      amount: "",
      frequency: "Monthly",
      refundable: false,
      optional: false,
    },
  ]);

  /* ================= STUDENT OVERRIDE ================= */
  const [studentFee, setStudentFee] = useState({
    studentId: "",
    overrideAmount: "",
    reason: "",
  });

  /* ================= TRANSPORT DATA ================= */
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    api.get("/admin/transport").then(res => {
      setVehicles(res.data || []);
    });
  }, []);

const [classes, setClasses] = useState([]);

useEffect(() => {
  api.get("/admin/classes")
    .then(res => setClasses(res.data || []))
    .catch(err => console.error("Classes fetch error", err));
}, []);


  /* ================= TRANSPORT CONFIG ================= */
  const [transportConfig, setTransportConfig] = useState({
    feeMode: "TRANSPORT", 
    vehicleId: "",
    transportFee: "",
    stopFees: {},
    stopNames: {},  
  });

  const selectedVehicle = vehicles.find(
    v => v._id === transportConfig.vehicleId
  );

  /* ================= AUTO STRUCTURE NAME ================= */
  useEffect(() => {
  if (
    basicInfo.session &&
    basicInfo.className &&
    basicInfo.section
  ) {
    setBasicInfo(prev => ({
      ...prev,
      structureName: `${prev.className}-${prev.section} (${prev.session})`,
    }));
  }
}, [basicInfo.session, basicInfo.className, basicInfo.section]);


  /* ================= COMPONENT BREAKDOWN ================= */
  const componentBreakdown = useMemo(() => {
    return components.map(c => ({
      name: c.name || "Unnamed",
      frequency: c.frequency,
      monthly:
        c.frequency === "Monthly"
          ? Number(c.amount || 0)
          : 0,
      annual:
        c.frequency === "Monthly"
          ? Number(c.amount || 0) * 12
          : Number(c.amount || 0),
    }));
  }, [components]);

  /* ================= MONTHLY BASE TOTAL ================= */
  const monthlyFeeTotal = useMemo(() => {
    const componentMonthly = componentBreakdown.reduce(
      (sum, c) => sum + c.monthly,
      0
    );

    const transportMonthly =
      transportConfig.vehicleId &&
      transportConfig.feeMode === "TRANSPORT"
        ? Number(transportConfig.transportFee || 0)
        : 0;

    return componentMonthly + transportMonthly;
  }, [componentBreakdown, transportConfig]);

  /* ================= ANNUAL BASE TOTAL ================= */
  const annualFeeTotal = useMemo(() => {
    const componentAnnual = componentBreakdown.reduce(
      (sum, c) => sum + c.annual,
      0
    );

    const transportAnnual =
      transportConfig.vehicleId &&
      transportConfig.feeMode === "TRANSPORT"
        ? Number(transportConfig.transportFee || 0) * 12
        : 0;

    return componentAnnual + transportAnnual;
  }, [componentBreakdown, transportConfig]);

  /* ================= HANDLERS ================= */
 /* ================= HANDLERS ================= */
const addComponent = () => {
  setComponents([
    ...components,
    {
      name: "",
      amount: "",
      frequency: "Monthly",
      refundable: false,
      optional: false,
    },
  ]);
};


 const updateComponent = (index, field, value) => {
  setComponents(prev =>
    prev.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    )
  );
};
const handleSave = async () => {
  if (!basicInfo.classId) {
    alert("Please select a class");
    return;
  }

  if (!basicInfo.session) {
    alert("Session missing from class");
    return;
  }
if (!basicInfo.section) {
  alert("Please select a section");
  return;
}

  if (components.length === 0) {
    alert("Add at least one fee component");
    return;
  }






 

  // 🚨 STOP MODE VALIDATION (VERY IMPORTANT)
if (
  transportConfig.feeMode === "STOP" &&
  (!transportConfig.stopFees ||
    Object.keys(transportConfig.stopFees).length === 0)
) {
  alert("Please enter STOP-wise transport fees");
  return;
}

const normalizedTransport =
  transportConfig.feeMode === "STOP"
    ? {
        ...transportConfig,
        stopFees: Object.fromEntries(
          Object.entries(transportConfig.stopFees).map(
            ([k, v]) => [k, Number(v)]
          )
        ),
         stopNames: transportConfig.stopNames, 
      }
    : transportConfig;

  try {
 const payload = {
  classId: basicInfo.classId,
  className: basicInfo.className,
  section: basicInfo.section,
  session: basicInfo.session,
  structureName: basicInfo.structureName,

  status: "ACTIVE",

  components,
  transportConfig: normalizedTransport,

  // 🔥🔥🔥 THIS WAS MISSING
  financeSummary: {
    monthlyBase: monthlyFeeTotal,
    annualBase: annualFeeTotal,
  },
};


    await api.post("/admin/fees/structure", payload);

    alert("Fee structure saved successfully ✅");
  } catch (error) {
    console.error(error);
    alert("Save failed ❌");
  }
};



  /* ================= UI ================= */
  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Fee Structure Management
        </h1>
        <p className="text-sm text-gray-500">
          Realistic school fee setup with transport rules
        </p>
      </div>

      {/* MODE SWITCH */}
      <div className="flex gap-2">
        {["class", "student", "explore"].map(m => (

          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm ${
              mode === m
                ? "bg-blue-600 text-white"
                : "border hover:bg-gray-50"
            }`}
          >
            {m === "class"
  ? "Class Fee Structure"
  : m === "student"
  ? "Student Fee Override"
  : "Fee Explorer"}

          </button>
        ))}
      </div>

      {/* ================= CLASS MODE ================= */}
      {mode === "class" && (
        <>
          {/* STRUCTURE INFO */}
          <section className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">
              Structure Details
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
        <input
  className="input"
  placeholder="Academic Session (e.g. 2024-25)"
  value={basicInfo.session}
  onChange={e =>
    setBasicInfo(prev => ({
      ...prev,
      session: e.target.value,
    }))
  }
/>

<select
  className="input"
  value={basicInfo.className}
  onChange={e => {
    const selected = classes.find(c => c.name === e.target.value);

    // ✅ same class ke saare sections nikalo
    const classSections = classes
      .filter(c => c.name === selected?.name)
      .map(c => c.section)
      .filter(Boolean);

    // ✅ ek hi baar basicInfo update
    setBasicInfo(prev => ({
      ...prev,
      className: selected?.name || "",
        classId: selected?._id || "",  
      section: "",
      structureName: "",
    }));

    // ✅ yahin se section aayega
    setSections([...new Set(classSections)]);

    // ✅ transport reset (ye sahi tha)
    setTransportConfig({
      feeMode: "TRANSPORT",
      vehicleId: "",
      transportFee: "",
      stopFees: {},
       stopNames: {},
    });
  }}
>
  

  <option value="">Select Class</option>
 {[...new Set(classes.map(c => c.name))].map(name => (
  <option key={name} value={name}>
    {name}
  </option>
))}
</select>

  {/* SECTION SELECT */}
<select
  className="input"
  value={basicInfo.section}
  onChange={e =>
    setBasicInfo(prev => ({
      ...prev,
      section: e.target.value,
    }))
  }
  disabled={sections.length === 0}
>
  <option value="">Select Section</option>

  {sections.map(sec => (
    <option key={sec} value={sec}>
      Section {sec}
    </option>
  ))}
</select>

              <input
                className="input bg-gray-50"
                disabled
                value={basicInfo.structureName}
              />
            </div>
          </section>

          {/* FEE COMPONENTS */}
          <section className="bg-white border rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">
                Fee Components
              </h2>
              <button
                onClick={addComponent}
                className="btn-primary"
              >
                + Add Component
              </button>
            </div>

            {components.map((c, i) => (
              <div
                key={i}
                className="grid md:grid-cols-6 gap-4 items-center"
              >
                <input
                  className="input"
                  placeholder="Component Name"
                  value={c.name}
                  onChange={e =>
  updateComponent(i, "name", e.target.value)
}

                />

                <input
                  type="number"
                  className="input"
                  placeholder="Amount"
                  value={c.amount}
                  onChange={e =>
  updateComponent(i, "amount", e.target.value)
}

                />

                <select
                  className="input"
                  value={c.frequency}
                onChange={e =>
  updateComponent(i, "frequency", e.target.value)
}

                >
                  <option>Monthly</option>
                  <option>One Time</option>
                </select>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={c.optional}
                 onChange={() =>
  updateComponent(i, "optional", !c.optional)
}

                  />
                  Optional
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={c.refundable}
                  onChange={() =>
  updateComponent(i, "refundable", !c.refundable)
}

                  />
                  Refundable
                </label>
              </div>
            ))}
          </section>

          {/* 🚍 TRANSPORT */}
          <section className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-indigo-700">
              🚍 Transport Fee
            </h2>

            {/* MODE */}
            <div className="flex gap-6">
              {["TRANSPORT", "STOP"].map(m => (
                <label key={m} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={transportConfig.feeMode === m}
                    onChange={() =>
                      setTransportConfig(prev => ({
                        ...prev,
                        feeMode: m,   
                      }))
                    }
                  />
                  {m === "TRANSPORT"
                    ? "Transport Wise (Class level)"
                    : "Stop Wise (Student level)"}
                </label>
              ))}
            </div>

            {/* ROUTE */}
    {/* ROUTE */}
<select
  className="input"
  value={transportConfig.vehicleId}
  onChange={e =>
    setTransportConfig(prev => ({
      ...prev,
      vehicleId: e.target.value,
      stopFees: {},          // ✅ route change → reset stop fees
    }))
  }
>
  <option value="">Select Transport / Route</option>
  {vehicles.map(v => (
    <option key={v._id} value={v._id}>
      {v.vehicleNo} – {v.route?.routeName}
    </option>
  ))}
</select>


           {/* TRANSPORT WISE */}
{transportConfig.feeMode === "TRANSPORT" && (
  <input
    type="number"
    className="input"
    placeholder="Monthly Transport Fee (₹)"
    value={transportConfig.transportFee}
    onChange={e =>
      setTransportConfig(prev => ({
        ...prev,
        transportFee: e.target.value,
      }))
    }
    disabled={!transportConfig.vehicleId}
  />
)}


     {/* STOP WISE */}
{transportConfig.feeMode === "STOP" &&
  selectedVehicle?.route?.stops && (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="grid grid-cols-2 font-semibold bg-gray-100 px-4 py-2">
        <span>Stop</span>
        <span>Monthly Fee (₹)</span>
      </div>

      {selectedVehicle.route.stops.map((s, idx) => (
  <div
     key={`${transportConfig.vehicleId}-${idx}`}   // ✅ STABLE + UNIQUE
    className="grid grid-cols-2 px-4 py-2 border-t"
  >

          <span>{s.stopName}</span>
       <input
  type="number"
  name={`stop-fee-${idx}`}     // 🔥 UNIQUE NAME
  autoComplete="off"          // 🔥 BROWSER AUTOFILL OFF
  inputMode="numeric"
  className="input"
  value={transportConfig.stopFees[idx] ?? ""}
  onChange={e =>
    setTransportConfig(prev => ({
      ...prev,
      stopFees: {
        ...prev.stopFees,
        [idx]: e.target.value,
      }, stopNames: {
        ...prev.stopNames,
        [idx]: s.stopName,   // 🔥 YAHI MISSING THA
      },
    }))
  }
/>


        </div>
      ))}
    </div>
)}


          </section>

          {/* 📊 FINANCE SUMMARY */}
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-blue-700 text-lg">
              Finance Summary
            </h3>

            <p>Session: {basicInfo.session || "—"}</p>
            <p>Class: {basicInfo.className || "—"}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">
                  Monthly Base Fee
                </p>
                <p className="text-xl font-bold">
                  ₹{monthlyFeeTotal}
                </p>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-500">
                  Annual Base Fee
                </p>
                <p className="text-xl font-bold">
                  ₹{annualFeeTotal}
                </p>
              </div>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden mt-4">
              <div className="grid grid-cols-4 bg-gray-100 px-4 py-2 font-semibold text-sm">
                <span>Component</span>
                <span>Frequency</span>
                <span>Monthly</span>
                <span>Annual</span>
              </div>

              {componentBreakdown.map((c, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 px-4 py-2 text-sm border-t"
                >
                  <span>{c.name}</span>
                  <span>{c.frequency}</span>
                  <span>₹{c.monthly}</span>
                  <span>₹{c.annual}</span>
                </div>
              ))}

              {transportConfig.vehicleId && (
                <div className="grid grid-cols-4 px-4 py-2 text-sm border-t bg-indigo-50">
                  <span>Transport Fee</span>
                  <span>Monthly</span>
                  <span>
                    {transportConfig.feeMode === "TRANSPORT"
                      ? `₹${transportConfig.transportFee || 0}`
                      : "—"}
                  </span>
                  <span>
                    {transportConfig.feeMode === "TRANSPORT"
                      ? `₹${
                          (transportConfig.transportFee || 0) *
                          12
                        }`
                      : "Applied per student"}
                  </span>
                </div>
              )}
            </div>

            {transportConfig.feeMode === "STOP" && (
              <p className="text-xs text-gray-600">
                Transport fee will be applied per student based on selected stop
              </p>
            )}
          </section>
        </>
      )}

      {/* ================= STUDENT MODE ================= */}
      {mode === "student" && (
        <section className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">
            Student Fee Exception
          </h2>



          <input
            className="input"
            placeholder="Student ID"
            value={studentFee.studentId}
            onChange={e =>
              setStudentFee({
                ...studentFee,
                studentId: e.target.value,
              })
            }
          />

          <input
            type="number"
            className="input"
            placeholder="Override Total Fee"
            value={studentFee.overrideAmount}
            onChange={e =>
              setStudentFee({
                ...studentFee,
                overrideAmount: e.target.value,
              })
            }
          />

          <textarea
            className="input"
            placeholder="Mandatory Reason"
            value={studentFee.reason}
            onChange={e =>
              setStudentFee({
                ...studentFee,
                reason: e.target.value,
              })
            }
          />
        </section>
        
      )}

      {/* ================= EXPLORE MODE ================= */}
{mode === "explore" && (
  <section className="bg-white border rounded-xl p-6">
    <FeeExplore />
  </section>
)}

      {/* ACTION */}
      <div className="flex justify-end gap-3">
       <button
  type="button"
   disabled={!basicInfo.classId || !basicInfo.section}
  onClick={handleSave}
  className={`btn-primary ${
    !basicInfo.classId || !basicInfo.section? "opacity-50 cursor-not-allowed" : ""
  }`}
>
  Save Fee Structure
</button>


      </div>
    </div>
  );
}
