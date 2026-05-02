export default {
    name: "neofetch",
    help: "Display system info.",
    run(args, ctx) {
        const ANSI = ctx.ANSI || {
            reset: "\x1b[0m",
            green: "\x1b[32m",
            blue: "\x1b[34m",
            white: "\x1b[37m",
            red: "\x1b[31m",
            grey: "\x1b[90m",
            yellow: "\x1b[33m"
        };
        const user = ctx.USER || "guest";
        const host = ctx.HOST || "host";

        const lines = [
            { text: `${ANSI.red}                   >[}}}####}}}[<:              ${user}${ANSI.reset}@${ANSI.red}${host}`, delay: 20},
            { text: `${ANSI.red}           ]####################[               ----------------`, delay: 20},
            { text: `${ANSI.red}        >}#####}####}##}####}#####})            OS${ANSI.reset}: NOS: Web Edition`, delay: 20},
            { text: `${ANSI.red}      [####}#####}#######}####}######}          Kernel${ANSI.reset}: ntoskrnl-26200.8246 `, delay: 20},
            { text: `${ANSI.red}    =}###}###}#####}##}##}#####}###}#}          Uptime${ANSI.reset}: Forever and a day `, delay: 20},
            { text: `${ANSI.red}   [###}#######}##})-+}####}#####}##]   :       Packages${ANSI.reset}: WSL2`, delay: 20},
            { text: `${ANSI.red}  [#######}#####}}-   <######}####}>   *#}      Shell${ANSI.reset}: yes `, delay: 20},
            { text: `${ANSI.red} >##}###}###}###}-   -##}######}#}    <###]     Theme${ANSI.reset}: Custom `, delay: 20},
            { text: `${ANSI.red} #####}###}###}}     #####}####}*    }##}##:    Icons${ANSI.reset}: ASCII `, delay: 20},
            { text: `${ANSI.red}<##}##}#######[     ##}#####}#}    >#######[    Terminal${ANSI.reset}: Web`, delay: 20},
            { text: `${ANSI.red}}#######}##}#*      ##}##}##}    =}###}##}##    CPU${ANSI.reset}: AMD Ryzen 5 7500F (12) @ 3.69GHz  `, delay: 20},
            { text: `${ANSI.red}##}#}###}##}       +#######     }###}#######    GPU${ANSI.reset}: RTX 3060 Ti`, delay: 20},
            { text: `${ANSI.red}}#####}##}}    }   -###}}:    }########}##}#    Memory${ANSI.reset}: 15502MiB / 32768MiB`, delay: 20},
            { text: `${ANSI.red}<##}##}#}-   =}#}   }#]     }###}##}#######[    `, delay: 20},
            { text: `${ANSI.red} }#####<    }####=        }#########}###}##:    ${ANSI.reset}${"\x1b[30m"}████${"\x1b[31m"}████${"\x1b[32m"}████${"\x1b[33m"}████${"\x1b[34m"}████${"\x1b[35m"}████${"\x1b[36m"}████${"\x1b[37m"}████${ANSI.reset}`, delay: 20},
            { text: `${ANSI.red} >##}[    <##}####>    +}###}##}##}###}###)     ${ANSI.reset}${"\x1b[90m"}████${"\x1b[91m"}████${"\x1b[92m"}████${"\x1b[93m"}████${"\x1b[94m"}████${"\x1b[95m"}████${"\x1b[96m"}████${"\x1b[97m"}████${ANSI.reset}`, delay: 20},
            { text: `${ANSI.red}  [}    -}#####}###}}}#######}###########}      `, delay: 20},
            { text: `${ANSI.red}       }###}}##}#########}######}##}###}}       `, delay: 20},
            { text: `${ANSI.red}     }###########}####}####}##}######}}*        `, delay: 20},
            { text: `${ANSI.red}      ]}##}##}#####}##}##########}}##}          `, delay: 20},
            { text: `${ANSI.red}        >}#####}}######}##}##}####})            `, delay: 20},
            { text: `${ANSI.red}           <}#####}##}##}######}]               `, delay: 20},
            { text: `${ANSI.red}               *[}}}}##}}}}}>                   `, delay: 20}
        ];

        return ctx.printLines(lines);
    }
};
