import { MouseButton, Connection } from "live-cat";
import { fromEvent } from "rxjs";
import { filter, tap } from "rxjs/operators";
export class FastTouchSideEffect {
  static Tolerance = 1;
  static Interval = 500;
  constructor(target: HTMLVideoElement, private cb: () => void) {
    const filterTouch = (event: PointerEvent) => event.pointerType === "touch";

    const down$ = fromEvent<PointerEvent>(target, "pointerdown").pipe(
      tap((e) => e.preventDefault()),
      filter(filterTouch)
    );
    const up$ = fromEvent<PointerEvent>(target, "pointerup").pipe(
      tap((e) => e.preventDefault()),
      filter(filterTouch)
    );

    let startTime: number;
    down$
      .pipe(
        filter((downEvent) => {
          startTime = Date.now();
          up$
            .pipe(
              filter(() => {
                const endTime = Date.now();
                const interval = endTime - startTime;
                return interval <= FastTouchSideEffect.Interval;
              }),
              filter((upEvent) => {
                const distance = Math.sqrt(
                  Math.pow(upEvent.clientX - downEvent.clientX, 2) +
                    Math.pow(upEvent.clientY - downEvent.clientY, 2)
                );
                return distance <= FastTouchSideEffect.Tolerance;
              })
            )
            .subscribe(() => {
              this.cb();
            });
          return true;
        })
      )
      .subscribe();
  }
  static sendMouseLeftButton(connection: Connection) {
    connection.send(new MouseButton(1, true).dumps());
  }
}
