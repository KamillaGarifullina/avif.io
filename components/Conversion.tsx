import ProgressBar from "@components/ProgressBar";
import { Settings } from "@components/SettingsBox";
import ConversionTimeEstimator from "@utils/ConversionTimeEstimator";
import Converter, { ConversionId, ConversionResult } from "@utils/converter";
import { splitNameAndExtension } from "@utils/utils";
import prettyBytes from "pretty-bytes";
import { ReactElement, useEffect, useState } from "react";
import Tooltip from "@components/Tooltip";

import arrow from "@assets/arrow.svg";

export interface ConversionProps {
  file: File;
  converter: Converter;
  settings: Settings;

  onFinished(outputFile: File): void;
}

function formatRemainingTimeEstimate(estimator: ConversionTimeEstimator) {
  if (estimator.minutes === undefined) return "";
  if (estimator.seconds === undefined) return "";

  if (estimator.minutes === 0 && estimator.seconds === 0)
    return "almost ready..";

  let result = "";
  if (estimator.minutes !== 0) {
    result += `${estimator.minutes} minute`;
    if (estimator.minutes > 1) {
      result += "s";
    }
  } else {
    result += `${estimator.seconds} seconds`;
  }

  result += " left";
  return result;
}

type ConversionStatus = "inProgress" | "cancelled" | "finished";

export default function Conversion(props: ConversionProps): ReactElement {
  const [status, setStatus] = useState<ConversionStatus>("inProgress");
  const [fileName, setFileName] = useState<string>();
  const [originalFormat, setOriginalFormat] = useState<string>();
  const [originalSize] = useState(props.file.size);
  const [progress, setProgress] = useState(0);
  const [outputSize, setOutputSize] = useState(0);
  const [outputObjectURL, setOutputObjectURL] = useState("");
  const [remainingTime, setRemainingTime] = useState("");
  const [conversionId, setConversionId] = useState<ConversionId>();
  const [conversionTimeEstimator] = useState(
    new ConversionTimeEstimator(50, 300)
  );

  useEffect(() => {
    (async () => {
      const [fileName, format] = splitNameAndExtension(props.file.name);
      setFileName(fileName);
      setOriginalFormat(format);
      conversionTimeEstimator.start();

      function onFinished(result: ConversionResult) {
        setStatus("finished");
        const outputFile = new File([result.data], `${fileName}.avif`);
        setOutputObjectURL(URL.createObjectURL(outputFile));
        setOutputSize(result.data.length);
        props.onFinished(outputFile);
      }

      function onProgress(progress: number) {
        setProgress(progress);
        conversionTimeEstimator.update(progress);
        setRemainingTime(formatRemainingTimeEstimate(conversionTimeEstimator));
      }

      setConversionId(
        await props.converter.convertFile(props.file, {
          ...props.settings,
          onFinished,
          onProgress,
          onError(e: string) {
            console.error(e);
            if (
              confirm(
                "Oh no, the conversion has failed. Can we use your file to check what went wrong and fix it in a future release?"
              )
            ) {
              (window as any).firebase
                .storage()
                .ref()
                .child(Date.now().toString())
                .put(props.file);
            }
          },
        })
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const percentageSaved = Math.max(Math.ceil(1 - outputSize / originalSize), 0);

  function cancelConverison() {
    if (status === "inProgress" && conversionId !== undefined) {
      props.converter.cancelConversion(conversionId);
      setStatus("cancelled");
    }
  }

  const finished = status === "finished";
  const cancelled = status === "cancelled";

  return (
    <div
      className={`conversion justify-between w-full relative z-10 flex flex-row items-center self-auto mt-4 py-2 px-3 bg-white rounded-md text-gray-900${
        finished ? "pointer-events-auto animate-bounceIn" : "progress group"
      } ${cancelled ? "hidden" : ""}`}
    >
      <div className=" flex flex-col items-baseline justify-between py-2">
        <p className="z-50 relative overflow-hidden whitespace-nowrap overflow-ellipsis select-none text-gray-900">
          {fileName?.substring(0, 20)}
          {finished ? ".avif " : " "}
        </p>
        <p className={`z-50 text-tiny text-gray-400 `}>
          {cancelled
            ? "cancelled"
            : finished
            ? percentageSaved + "% smaller · " + prettyBytes(outputSize)
            : (progress * 100).toFixed() +
              "%" +
              (remainingTime !== "" ? " · " + remainingTime : "")}

          {percentageSaved === 0 && (
            <Tooltip
              text="Why 0%?"
              explanation="Adjust your conversion settings to achieve higher compression."
            />
          )}
        </p>
      </div>
      {finished ? (
        ""
      ) : (
        <p className="z-50 mr-6 text-gray-900 rounded-md ml-2">
          <span className="conversion_format">
            {originalFormat} · {prettyBytes(originalSize)}
          </span>
        </p>
      )}
      <a
        role="button"
        tabIndex={0}
        title={`download ${fileName}`}
        download={`${fileName}.avif`}
        href={outputObjectURL}
        className={`group absolute top-0 right-0 w-6 h-full overflow-hidden cursor-pointer transform ${
          finished ? "" : "hidden"
        }`}
      >
        {" "}
        <span
          style={{ backgroundSize: "200%" }}
          className="absolute top-0 right-0 bottom-0 left-0 bg-gradient cursor-pointer bg-center bg-cover rounded-r-md"
        ></span>
        <span
          className="z-50 text-white bg-no-repeat bg-center absolute top-0 right-0 left-0 bottom-0 transform rotate-180 hover:scale-110 hover:translate-y-1 ease-in transition-all duration-300"
          style={{
            backgroundImage: `url(${arrow})`,
            backgroundSize: "30%",
          }}
        ></span>
      </a>
      {status === "inProgress" && <ProgressBar progress={progress} />}
      {status === "inProgress" && (
        <a
          role="button"
          title="stop conversion"
          className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 rounded-lg absolute left-full z-50 flex items-center justify-center w-4 h-4 ml-1 pb-1 transition-all ease-out duration-300"
          onClick={cancelConverison}
          onKeyPress={cancelConverison}
          tabIndex={0}
        >
          ■
        </a>
      )}
    </div>
  );
}
